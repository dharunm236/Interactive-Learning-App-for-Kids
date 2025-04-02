pipeline {
    agent any
    tools {
        nodejs "Node23" // Matches the NodeJS name in Global Tool Configuration
    }
    environment {
        VERCEL_TOKEN = credentials('vercel-token') // ID of the stored Vercel token
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/dharunm236/Interactive-Learning-App-for-Kids.git', branch: 'main'
            }
        }
        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }
        stage('Run Tests') {
            steps {
                bat 'npm test' // Ensure tests are defined in package.json
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('Kidz-learn') { // Matches the SonarQube server name in Jenkins
                    bat 'sonar-scanner'
                }
            }
        }
        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }
        stage('Deploy to Vercel') {
            steps {
                tool nodeJS
                withEnv(["PATH+NODE=${tool 'NodeJS'}/bin"]) {
                    bat 'npm install -g vercel'
                    bat 'vercel --token %VERCEL_TOKEN% --prod'
        }
    }
        }
    }
    post {
        always {
            echo 'Pipeline finished!'
        }
        success {
            echo 'Deployment to Vercel succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}