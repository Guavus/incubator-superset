# Theme Support

## Header

### Steps

* Add Company logo at  `./superset/assets/images/guavus_logo.svg`
* Update new logo path for `APP_ICON` in `./config.py`
* Update Navbar Template at  `./superset/templates/appbuilder/navbar.html`
* Define custom less at `./superset/assets/stylesheets/guavus.less`
* Include  `guavus.less` in `./superset/assets/stylesheets/superset.less`

## Footer

### Steps-

* Define  `TIMEZONE` and `COPYRIGHT`  vars in  `./config.py` to display in Footer
* Define Footer Template  `./superset/templates/appbuilder/footer.html`
* Include `Footer Template` in `./superset/templates/appbuilder/baselayout.html` and `./superset/templates/superset/basic.html` at  `footer` tag
