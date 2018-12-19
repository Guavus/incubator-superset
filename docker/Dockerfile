FROM python:3.6.5

MAINTAINER Arpit Agarwal <arpit.agarwal@guavus.com>

# Configure environment
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    HOME=/home/work

ENV user=testuser

RUN apt-get update
RUN apt-get install sudo

RUN adduser --disabled-password --gecos '' ${user}
RUN adduser ${user} sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER ${user}

RUN sudo apt-get update -y && sudo apt-get install -y build-essential libssl-dev \
    libffi-dev python3-dev libsasl2-dev libldap2-dev \
    libsasl2-modules
    
RUN sudo mkdir -p $HOME/incubator-superset

WORKDIR $HOME/incubator-superset

COPY ./ ./

RUN pip install --user --upgrade setuptools pip && pip install --user wheel && sudo python ./setup.py bdist_wheel && pip install --${user} ./dist/*.whl

# Install nodejs for custom build
# https://github.com/apache/incubator-superset/blob/master/docs/installation.rst#making-your-own-build
# https://nodejs.org/en/download/package-manager/
RUN sudo curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN sudo apt-get install -y nodejs
RUN sudo curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -; \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list; \
    sudo apt-get update; \
    sudo apt-get install -y yarn

RUN cd superset/assets && yarn && yarn run build && cd ../../

ENV PATH=/home/work/incubator-superset/superset/bin:$PATH \
    PYTHONPATH=./superset/:$PYTHONPATH

COPY docker-init.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-init.sh

EXPOSE 8088

ENTRYPOINT ["docker-init.sh"]

