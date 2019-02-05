FROM ubuntu:18.04
MAINTAINER Arpit Agarwal <arpit.agarwal@guavus.com>

# Configure environment
ENV user=guavus-raf

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    HOME=/home/${user} \
    DEBIAN_FRONTEND=noninteractive
    
RUN useradd --user-group --create-home --no-log-init --shell /bin/bash ${user}

RUN apt-get update -y

RUN apt-get install -y build-essential libssl-dev \
    libffi-dev python3-dev libsasl2-dev libldap2-dev libxi-dev \
    curl \
    python3-pip \
    libsasl2-modules libsasl2-2 libsasl2-modules-gssapi-mit krb5-user

RUN mkdir -p $HOME/incubator-superset \
    mkdir -p /etc/security/keytabs/ \
    mkdir -p /etc/cert/

WORKDIR $HOME/incubator-superset

COPY ./ ./

RUN pip3 install ./dist/*.whl

RUN curl -sL https://deb.nodesource.com/setup_8.x |  bash -
RUN apt-get install -y nodejs
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -; \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list; \
    apt-get update; \
    apt-get install -y yarn

RUN cd superset/assets && yarn && yarn run build && cd ../../

ENV PATH=/home/${user}/incubator-superset/superset/bin:$PATH \
    PYTHONPATH=./superset/:$PYTHONPATH

COPY docker-init.sh /usr/local/bin/

RUN chmod +x /etc/cert
RUN chmod +x /usr/local/bin
RUN chown -R ${user}:${user} $HOME

USER ${user}

EXPOSE 8088

ENTRYPOINT ["docker-init.sh"]
