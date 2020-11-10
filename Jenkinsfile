pipeline {
  agent any

  tools { nodejs "Jenkins_NodeJS" }
  
  environment {
      DIS_DESC = "Jenkins Pipeline Build for Flower Power"
      DIS_FOOT = "(Build number ${env.BUILD_NUMBER})"
      DIS_TITL = "${JOB_NAME} - ${env.BUILD_NUMBER}"
      MONGO_USERNAME = "adminx"
      MONGO_PASSWORD = "adminx"
      INITIAL_PASSWORD  = "somepass"

      NESTJS_PORT=7080
      NESTJS_DEBUG_MODE=false
      NESTJS_NODE_ENV='production'
      NESTJS_MONGO_CONNECTION_STRING_DEBUG="mongodb://localhost:27017/flowerpower"
      NESTJS_MONGO_CONNECTION_STRING_PROD="mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@localhost:27018/flowerpower"
      MY_PROJECT_NAME="fp"
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
        sh "docker ps -a"
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