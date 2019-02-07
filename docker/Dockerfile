FROM python:3.6
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
        libsasl2-modules libsasl2-2 libsasl2-modules-gssapi-mit krb5-user \
        && \
    mkdir -p $HOME/incubator-superset \
    mkdir -p /etc/security/keytabs/ \
    mkdir -p /etc/cert/ \
    && \
    apt-get autoremove -y && \
    apt-get clean && rm -rf "/var/lib/apt/lists/*" && \
    echo OK

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt-get install -y nodejs

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y yarn

WORKDIR $HOME/incubator-superset

COPY ./ ./

RUN pip install --upgrade setuptools pip \
    && pip install ./dist/*.whl \
    && rm -rf /root/.cache/pip

RUN cd superset/assets \
    && yarn --non-interactive --frozen-lockfile --link-duplicates \
    && yarn run sync-backend \
    && yarn run build \
    && rm -rf node_modules \
    && yarn cache clean \
    apt-get remove -y \
        \*-dev \
        build-essential \
        python-pip \
        python-wheel

RUN apt-get purge --auto-remove -y nodejs

ENV PATH=/home/${user}/incubator-superset/superset/bin:$PATH \
    PYTHONPATH=./superset/:$PYTHONPATH

COPY docker-init.sh /usr/local/bin/

RUN chmod +x /etc/cert
RUN chmod +x /usr/local/bin
RUN chown -R ${user}:${user} $HOME

USER ${user}

EXPOSE 8088

ENTRYPOINT ["docker-init.sh"]
