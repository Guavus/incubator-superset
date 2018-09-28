#!/bin/bash
export ARTIFACTORY_USERNAME=dev-deployer
export ARTIFACTORY_PASSWORD=dev@guavus

export version=`cat VERSION`
MAJOR_VERSION = $version | awk -F. '{print $1}'
MINOR_VERSION = $version | awk -F. '{print $2}'
PATCH_VERSION = $version | awk -F. '{print $3}'

export RPM_ARTIFACTORY=artifacts.ggn.in.guavus.com:4245/ggn-dev-rpms/superset/release/$MAJOR_VERSION/
export PUSH_RPM_TO_ARTIFACTORY=1
export PUSH_TAR_TO_ARTIFACTORY=1



# artifacts.ggn.in.guavus.com:/ggn-dev-rpms/superset/{target-stage}/{major-version}/