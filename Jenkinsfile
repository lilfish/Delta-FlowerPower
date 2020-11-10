pipeline {
  agent any

  tools { nodejs "Jenkins_NodeJS" }
  
  environment {
      DIS_DESC = "Jenkins Pipeline Build for Flower Power"
      DIS_FOOT = "(Build number ${env.BUILD_NUMBER})"
      DIS_TITL = "${JOB_NAME} - ${env.BUILD_NUMBER}"
      MONGO_USERNAME = "admin"
      MONGO_PASSWORD = "admin"
      INITIAL_PASSWORD  = "somepass"
    }
  stages {
    stage("Touch .env file") {
      steps {
        writeFile file: '.env', text: ''
      }
    }
    stage('NestJS Test') {
      steps { 
        echo 'Testing nestjs jest'
        sh 'node -v'
        dir("nestjs") {
          // sh 'npm prune'
          // sh 'npm install'
          // sh 'npm test'
        }
      }
    }

    stage('Build test') {
      steps {
        echo 'Deploying....'
        sh "docker-compose down"
        sh "docker-compose up --build --force-recreate -d"
      }
    }

  }
  post { 
      success { 
        discordSend description: env.DIS_DESC, footer: env.DIS_FOOT, link: env.BUILD_URL, result: currentBuild.currentResult, title: env.DIS_TITL, webhookURL: env.WEBHOOK_URL
      }
      unsuccessful { 
        discordSend description: env.DIS_DESC + "- FAILED", footer: env.DIS_FOOT, link: env.BUILD_URL, result: currentBuild.currentResult, title: env.DIS_TITL, webhookURL: env.WEBHOOK_URL
      }
    }
}