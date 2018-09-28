#!/usr/bin/env groovy

/*
This is a sample Jenkinsfile to demonstrate the list of stages
that should be implemented for continuous integration and continuous
deployment of a rpmized application.
This pipeline expects following branch names in GitHub repository
that has to be followed:
master
feature/JIRA-ID-Description
fix/JIRA-ID-Description
release/X.Y.Z
This pipeline also implements stages for pull requests testing
hence it is strongly recommended to follow pull request practices.
Which is: Nothing can be merged into master or release branch without
creating a pull request.
Pipeline follows following Artifact versioning strategy which in
this case is a rpm tag promotion:
If Branch Name is feature/JIRA-ID-Description or fix/JIRA-ID-Description
  then, rpmTag = JIRA-ID (From branch name, ephemeral Artifact)
If Branch Name is PR-ID
  then, rpmTag = PR-ID (From PR name, ephemeral Artifact)
If Branch Name is master or release,
  then, rpmTag = <module vesion>-<currentBuild number>-dev
After dev test, dev tag prmotes to qa, such as:
    rpmTag = <module vesion>-<currentBuild number>-qa
After QA test, qa tag promotes to rc, such as:
    rpmTag = <module vesion>-<currentBuild number>-rc
After Acceptance test, rc tag prmotes to prod -
    rpmTag = <module vesion>-<currentBuild number>-prod
* Ephemeral artifacts created with feature or fix Branches
 and with pull should get deleted after closure of the
 branch/PR.
* Note that rpm tags promotion on master or release branches
does not create separate artifacts but a different tag to
the same rpm image which should be kept until the image is
in use.
*/

pipeline {
  agent any

    environment {
    // Define global environment variables in this section
    buildNum = currentBuild.getNumber()
    buildType = BRANCH_NAME.split('/').first()
    branchVersion = BRANCH_NAME.split('/').last()
    buildVersion = '1.0.0'
    stRepoPath= 'superset'
    stFrameworkPath = "${env.stRepoPath}/automation"
  }
  stages {

    stage("Build and test") {
      parallel {

        stage("Unit test") {
          steps {
            echo "Run Commmands to execute unit test"
           // sh 'cd $WORKSPACE/source/libs/libJoiner && mvn test'
          }
        }
        stage("Code coverage") {
          steps {
            echo "Run Commmands to execute code coverage test"
            //sh 'cd $WORKSPACE/source/libs/libJoiner && mvn cobertura:cobertura'
          }
        }
        stage("Static code analysis or Checkstyle") {
          steps {
            echo "Run Commmands to execute static code analysis test"
            //sh 'cd $WORKSPACE/source/plugins/quick-joiner && mvn checkstyle:check'
          }
        }
      }
    }
    stage("Build or Compile") {
      steps {
        echo "Run Commmands to trigger build"
        //sh "make all"
      }
    }
    stage('Code Quality with SonarQube') {
        steps {
            script {
                // requires SonarQube Scanner 2.8+
                // Value of this home is
                // /var/jenkins_home/tools/hudson.plugins.sonar.SonarRunnerInstallation/sonar
                // As in Jenkins Global Tool Config we have specified name
                // as "sonar"
                // scannerHome = tool 'sonar'
                // echo scannerHome
                // sh 'cd $WORKSPACE/source/plugins/quick-joiner && mvn sonar:sonar  -Dsonar.host.url=http://192.168.135.114:9000  -Dsonar.login=4e2573327e1f23649e58cca3b689f9cab19ef751'
            }
        }
    }
    stage('Create RPMs') {
      steps {
        echo "Run Commmand to trigger rpm build - module-A:${env.rpmTag}"
        sh "make build-rpms"
      }
    }

    stage("Push rpm images in artifactory") {
      steps {
        echo "Run Commmand to push rpm image in artifactory"
        sh "make publish-rpms"
      }
    }

    stage("Deploy the particular plugin") {
      when {
        expression {
          env.buildType ==~ /(feature|PR-.*|fix)/
        }
      }
      steps {
        // Stubs should be used to perform functional testing
        echo "Deploy the Artifact on ephemeral environment"

  //sh "sshpass -p guavus@123 ssh -o StrictHostKeyChecking=no root@192.168.135.82 \"cd /etc/reflex-provisioner/ && yum -y remove cdap-plugins-solution-installer && yum clean all && yum -y install cdap-plugins-solution-installer && ./scripts/generate_inventory/cli.py refresh --inventory_name acc-nightly001 --stage_type dev && touch a && ansible-playbook playbooks/guavus_cdap_plugins/undeploy.yml -i inventory/generated/dev/acc-nightly001/hosts --user root -e  'ansible_ssh_pass=guavus@123' && ansible-playbook playbooks/guavus_cdap_plugins/deploy.yml -i inventory/generated/dev/acc-nightly001/hosts --user root -e  'ansible_ssh_pass=guavus@123'\""



     }
    }

    stage("Test the particular plugin") {
      when {
        expression {
          // Run only for buildTypes master or Release
          env.buildType ==~ /(feature|PR-.*|fix)/
        }
      }
      steps {
        // supporting components have fixed versions
        echo "Trigger test run to verify code changes"
        //checkout([$class: 'GitSCM', branches: [[name: '*/automation']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: "${env.stRepoPath}"], [$class: 'CleanBeforeCheckout'], [$class: 'SparseCheckoutPaths', sparseCheckoutPaths: [[path: 'automation']]]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: '975651de-037c-436e-9e10-069e988d7d57', url: 'https://github.com/Guavus/cdap-plugins']]])

        //echo "Trigger integration test run with fixed versions"

      //sh "rm -rf venv/"

      //sh "virtualenv venv && source venv/bin/activate && cd cdap-plugins/automation && pip install --extra-index-url http://192.168.192.201:5050/simple/ --trusted-host 192.168.192.201 -r requirements.txt && python -m pytest --testbed=resources/testbeds/open_nebula_nightly.yml --validationConfig=resources/joinplugin/join_plugin.yml tests/JoinPlugin/test_joinplugin.py && deactivate"

              }
    }

    stage("Promote Artifact to QA") {
        steps {
            echo "Promote Artifact name to module-A: in artifactory"
        }
    }

    stage("Deploy on the QA environment") {
        when {
        expression {
            env.buildType ==~ /(feature|PR-.*|fix)/
        }
        }
        steps {
            // Stubs should be used to perform functional testing
            echo "Deploy the Artifact on ephemeral environment"

            //sh "sshpass -p guavus@123 ssh -o StrictHostKeyChecking=no root@192.168.135.82 \"cd /etc/reflex-provisioner/ && yum -y remove cdap-plugins-solution-installer && yum clean all && yum -y install cdap-plugins-solution-installer && ./scripts/generate_inventory/cli.py refresh --inventory_name acc-nightly001 --stage_type dev && touch a && ansible-playbook playbooks/guavus_cdap_plugins/undeploy.yml -i inventory/generated/dev/acc-nightly001/hosts --user root -e  'ansible_ssh_pass=guavus@123' && ansible-playbook playbooks/guavus_cdap_plugins/deploy.yml -i inventory/generated/dev/acc-nightly001/hosts --user root -e  'ansible_ssh_pass=guavus@123'\""
        }
    }

    stage("Test on the QA environment") {
        when {
            expression {
                // Run only for buildTypes master or Release
                env.buildType ==~ /(feature|PR-.*|fix)/
            }
        }

        steps {
            // supporting components have fixed versions
            echo "Trigger test run to verify code changes"
            //checkout([$class: 'GitSCM', branches: [[name: '*/automation']], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: "${env.stRepoPath}"], [$class: 'CleanBeforeCheckout'], [$class: 'SparseCheckoutPaths', sparseCheckoutPaths: [[path: 'automation']]]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: '975651de-037c-436e-9e10-069e988d7d57', url: 'https://github.com/Guavus/cdap-plugins']]])

            echo "Trigger integration test run with fixed versions"

            //sh "rm -rf venv/"

            //sh "virtualenv venv && source venv/bin/activate && cd cdap-plugins/automation && pip install --extra-index-url http://192.168.192.201:5050/simple/ --trusted-host 192.168.192.201 -r requirements.txt && python -m pytest --testbed=resources/testbeds/open_nebula_nightly.yml --validationConfig=resources/joinplugin/join_plugin.yml tests/JoinPlugin/test_joinplugin.py && deactivate"

        }
    }

    stage("Promote Artifact to RC") {
      when {
        expression {
          // Run only for buildTypes master or Release
          env.buildType in ['master','release']
        }
      }
      environment {
        rpmTagStage = "rc"
        rpmTag = "${env.rpmTagVersion}-${rpmTagStage}"
      }
      steps {
        // supporting components have fixed versions
        echo "Promote Artifact name to module-A:${rpmTag}"
      }
    }

    stage("Deploy and test on the Pre-Prod environment") {
      when {
        expression {
          // Run only for buildTypes master or Release
          env.buildType in ['master','release']
        }
      }
      steps {
        // supporting components have fixed versions
        echo "Deploy the Artifact on staging equivalent setup"
        echo "Trigger integration test run with latest stable versions"
      }
    }

    stage("Promote Artifact to PROD") {
      when {
        expression {
          // Run only for buildTypes master or Release
          env.buildType in ['master','release']
        }
      }
      environment {
        rpmTagStage = "prod"
        rpmTag = "${env.rpmTagVersion}-${rpmTagStage}"
      }
      steps {
        // supporting components have fixed versions
        echo "Promote Artifact name to module-A:${rpmTag}"
      }
    }
  }
}