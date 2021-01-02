pipeline {
    agent any

    tools { nodejs "Jenkins_NodeJS" }
    environment {
        DIS_DESC = "Jenkins Pipeline Build for Flower Power"
        DIS_FOOT = "(Build number ${env.BUILD_NUMBER})"
        DIS_TITL = "${JOB_NAME} - ${env.BUILD_NUMBER}"

        MONGO_USERNAME = "${env.FLOWERPOWER_MONGO_USERNAME}"
        MONGO_PASSWORD = "${env.FLOWERPOWER_MONGO_PASSWORD}"
        INITIAL_PASSWORD  = "${env.FLOWERPOWER_INITIAL_PASSWORD}"

        NESTJS_PORT=7080
        NESTJS_DEBUG_MODE=false
        NESTJS_NODE_ENV='production'
        NESTJS_MONGO_CONNECTION_STRING_DEBUG="mongodb://localhost:27017/flowerpower"
        NESTJS_MONGO_CONNECTION_STRING_PROD="mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@fp_mongodb:27018/flowerpower"
    }
    
    stages {
        // Generate empty .env file so we can use our own
        stage("Touch .env file") {
            steps {
                writeFile file: '.env', text: ''
            }
        }
        // Run field application python build
        stage('Buid Field Application - Python') {
            steps {
                echo 'Building python application'
                sh 'docker create --name fieldapp-build-tmp cdrx/pyinstaller-windows'
                sh 'chmod +x ./field_application/fieldapp_entrypoint.sh'
                sh 'docker cp ./field_application fieldapp-build-tmp:/app/'
                sh 'docker commit fieldapp-build-tmp fieldapp-build'
                sh 'docker run --name field_app_build --entrypoint "/app/fieldapp_entrypoint.sh" fieldapp-build'
                sh "docker cp field_app_build:/tmp/backend_dist ./field_application/public"
            }
        }
        
        // Run field application electron build
        stage('Buid Field Application - Electron') {
            steps { 
                dir("field_application") {
                    echo 'Building electron application'
                    writeFile file: '.env', text: 'VUE_APP_MODE=PRODUCTION'
                    sh 'npm prune'
                    sh 'npm install'
                    sh 'npm run electron:winbuild'
                    sh "ls ./field_app_build -a"
                }
            }      
        }

        //Zip the dist_electron
        stage('Zipping and copying build folders') {
            steps { 
                script {
                    try {
                        sh 'mkdir -p ./nestjs/public/files/builds'
                    } catch (Exception e) {
                        sh 'echo "Could not make builds folder in ./nestjs/public/files/builds'
                    }
                    sh 'echo "Zipping win-unpacked"'
                    try {
                        zip zipFile: './nestjs/public/files/builds/win-unpacked.zip', archive: false, dir: './field_application/field_app_build/win-unpacked', overwrite: true
                    } catch (Exception e) {
                        sh 'echo "Could not zip win-unpacked'
                    }
                    sh 'Moving setup.exe to nestjs'
                    try {
                        sh 'cp "./field_application/field_app_build/field_application Setup 0.1.0.exe" "./nestjs/public/files/builds/field_application Setup 0.1.0.exe"'
                    } catch (Exception e) {
                        sh 'echo "Could not copy setup.exe to ./nestjs/public/files/builds'
                    }
                    sh 'ls ./nestjs/public/files'
                    sh 'ls ./nestjs/public/files/builds'
                }
            }
        }
        // Run NestJS jest test
        stage('NestJS API Test') {
            steps { 
                echo 'Testing NestJS API using Jest'
                sh 'node -v'
                dir("nestjs") {
                    sh 'npm prune'
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        // Build & Deploy using docker compose
        stage('Build test') {
            steps {
                script {
                    echo "Current branch: " + env.BRANCH_NAME
                    if (env.BRANCH_NAME == "master"){
                        echo 'Deploying....'
                        sh "docker-compose down"
                        sh "docker-compose up --build --force-recreate -d"
                        sh "docker ps -a"
                    } else {
                        echo "Not deploying since it's not 'master' branch"
                    }
                }
            }
        }
    }
    post { 
        always {
            script {
                echo env.BRANCH_NAME
                try {
                    sh 'docker container stop field_app_build'
                    sh 'docker container rm field_app_build'
                } catch (Exception e) {
                    sh 'echo "Could not stop/remove field_app_build"'

                }
                try {
                    sh 'docker container stop fieldapp-build-tmp'
                    sh 'docker container rm fieldapp-build-tmp'
                } catch (Exception e) {
                    sh 'echo "Could not stop/remove fieldapp-build-tmp"'
                }
                if(env.BRANCH_NAME == "master"){
                    sh "docker logs fp_nginx"
                    sh "docker logs fp_mongodb"
                    sh "docker logs fp_nestjs"

                    echo currentBuild.currentResult
                }
                cleanWs()
            }
        }
        success {
            script {
                echo "Succesfully build"
                if(env.BRANCH_NAME == "master"){
                    echo "Sending success message to discord server"
                    discordSend description: env.DIS_DESC, footer: env.DIS_FOOT, link: env.BUILD_URL, result: currentBuild.currentResult, title: env.DIS_TITL, webhookURL: env.WEBHOOK_URL
                }
            }
        }
        unsuccessful { 
            script {
                echo "Unsuccesfully build"
                if(env.BRANCH_NAME == "master"){
                    echo "Sending unsuccess message to discord server"
                    discordSend description: env.DIS_DESC + "- FAILED", footer: env.DIS_FOOT, link: env.BUILD_URL, result: currentBuild.currentResult, title: env.DIS_TITL, webhookURL: env.WEBHOOK_URL
                }
            }
        }
    }
}
