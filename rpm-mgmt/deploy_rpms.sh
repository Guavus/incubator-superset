#!/usr/bin/env bash
# Pushes the generated rpms to artifactory
#
# Usage:
#     sh deploy_rpms.sh
#
#	  rpm must have been generated first. Run make publish-rpms 

set -e

pushd "$(dirname "$0")"

source ../artifactory_mgmt.sh

INSTALLER_RPM=`ls ../dist/installer`


print_lines(){
    for i in `seq 1 4`;
    do
        echo " # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #"
    done
}

# rpms should only be pushed from build agents where we configured PUSH_TO_ARTIFACTORY=1
if [[ ${PUSH_RPM_TO_ARTIFACTORY} == '1' ]]; then
    echo "Pushing rpm for superset solution installer to artifactory"
    curl --user $ARTIFACTORY_USERNAME:$ARTIFACTORY_PASSWORD -X PUT "$RPM_ARTIFACTORY/" -T ../dist/installer/$INSTALLER_RPM
    echo "Published RPM for superset solution installer successfully"

else
    print_lines
    echo
    echo "WARNING:"
    echo "    Not pushing rpms to artifactory. To do it:"
    echo "        export PUSH_RPM_TO_ARTIFACTORY=1"
    echo
    print_lines
fi


popd