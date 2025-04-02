pipeline {
    agent any
    tools {
        nodejs "Node" // Matches the NodeJS name in Global Tool Configuration
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
                sh 'npm install'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'npm test' // Ensure tests are defined in package.json
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') { // Matches the SonarQube server name in Jenkins
                    sh 'sonar-scanner'
                }
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Deploy to Vercel') {
            steps {
                sh 'vercel --token $VERCEL_TOKEN --prod'
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