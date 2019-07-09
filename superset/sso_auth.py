import logging
from datetime import timezone, datetime
import jwt
from cryptography.hazmat.backends import default_backend
from cryptography.x509 import load_pem_x509_certificate

from flask import g, redirect, request
from flask_login import login_user
from superset import security_manager
from . import config

def get_publickey():
    key = config.KNOX_PUBLIC_KEY
    #coverting to pem cert string
    PEM_HEADER = "-----BEGIN CERTIFICATE-----\n"
    PEM_FOOTER = "\n-----END CERTIFICATE-----"
    cert_str = PEM_HEADER + key + PEM_FOOTER
    cert_obj = load_pem_x509_certificate(cert_str.encode('ascii'), default_backend())
    return cert_obj.public_key()

def get_token_contents(token):
    contents = jwt.decode(token,get_publickey())
    return contents

def _find_user(username, sm):
    """extracted from flask_appbuilder.security.manager.BaseSecurityManager.find_user"""
    user = sm.find_user(username)
    if not user:
        user = security_manager.add_user(
                username= username,
                first_name= username,
                last_name=username,
                email=username + '@email.notfound',
                role=security_manager.find_role("Admin")
            )
    return user

def parse_hadoop_jwt():
    if(config.KNOX_SSO_ENABLED):
        logging.info("Attaching JWT handler")
        jwt_token = request.cookies.get("hadoop-jwt", None)
        logging.debug("Token: %s"%jwt_token)
        
        sso_login_url = config.KNOX_SSO_URL+"?originalUrl="+request.url
        logging.debug("SSO LOGIN URL:"+sso_login_url)  

        if not jwt_token:
            logging.warn("Token not found")
            return redirect(sso_login_url)

        try: 
            token_contents = get_token_contents(jwt_token) 
        except jwt.ExpiredSignatureError:
                logging.error("Signature expired. Please log in again.")  
                return redirect(sso_login_url)
        except jwt.InvalidTokenError:
                logging.error("Invalid token. Please log in again.")  
                return redirect(sso_login_url)

        token_expiry = int(token_contents['exp'])
        now = int(datetime.now(tz=timezone.utc).timestamp())
        logging.info("Token Expries in "+ str(token_expiry - now )+" seconds.")
        
        #check token_expiry 
        if ( token_expiry - now ) <= 0:
            logging.warn("Failed login because of token expiry")
            return redirect(sso_login_url)

        #check user.is_authenticated 
        if g.user is not None and g.user.is_authenticated:
            logging.debug("Already authenticated: %s"%g.user)
            return None        
    
        username = token_contents['sub']
        logging.debug("Username from token %s"%username)
        
        #find user
        user = _find_user(username, security_manager)
        if not user:
            logging.warn("Authentication failed for user: %s"%user)
            return redirect(sso_login_url)
        
        login_user(user, remember=False)
        return None

