Web PBA Autumn 2026 Development Environments Project 

# <u>Containerizing a Web Application</u> 

## Objective: 

The goal of the project is to containerise an existing web application using Docker and Docker-Compose. 

Email a link to the code repo which should be done by the start of the holiday (9 October). Study points for entry to the exam will be awarded on the basis of a source code repo link, and README file. You will give a demo of the application in the last session before the holiday (ie. The 9<sup>th</sup> October). 

## Expected Skills: 

1. Familiarity with web development principles, including databases 

2. Knowledge of Docker and containerisation concepts. 

3. Basic understanding of docker-compose and its usage. 

These expectations can be met through existing knowledge, working through material placed on ITS Learning and group research. 

## Problem Description: 

In this project, you will need to containerise an existing application of your own choosing using Docker and Docker-Compose (or another container system such as Podman). You may need to research Docker Compose to gain an understanding of its purpose and usage. You will need to create one or more YAML files to build an image for the application, taking into account best practices for efficient (staged builds) and secure (rootless) image creation. The application should make use of the concept of Docker Volumes and the image should include a database and a named network. 

An example of such an approach is here: 

<u>https://learn.microsoft.com/en-us/visualstudio/docker/tutorials/tutorial-multi-containerapp-mysql</u> 

Project Steps: 

1. Research Docker-Compose: Understand the basics of Docker-Compose and its role in running multi-container applications. A simple start with Docker Compose is here: 

<u>https://docs.docker.com/compose/gettingstarted/</u> 

2. Select an application: Choose an existing application for containerization. The focus is on delivering a solution so don’t spend time building a new application. 

3. Create any necessary YAML files for your solution: Ensure that they follow good practices for efficient and secure image creation. You can limit the memory and CPU usage for example and try to keep the size of the image as small as possible. 

Web PBA Autumn 2026 Development Environments Project 

<u>https://docs.docker.com/compose/ https://docs.docker.com/develop/security-best-practices/</u> 

4. Test any Dockerfiles: Build the Docker image using the Dockerfile and test the application to ensure it runs correctly in a container. 

5. Create a docker-compose.yml file: Define a docker-compose.yml file to configure and run the containerised application. This may need more than one ‘build’ section. 

6. Run the Application using Docker Compose: Use the 'docker-compose up' command to start the containerized application and verify that it works as expected. Use the docker compose down command to stop the container. As you are using volumes test that you can dynamically change the application. Use docker stats to get data on the running application. 

7. Create a README file: Write a README file that explains the steps to reproduce the containerization process, and how to use the Docker-Compose file to run the application. 

### Optional: 

8. Using ssh and port forwarding you can run the containerized application remotely in a secure way. You can do this as well on a cloud provider such as Azure if you use this.( eg ssh -L 3000:127.0.0.1:3000 you@your_remote forwards the output from your remote machine to your local browser – so you can forward the container port to your remote and then to your own browser) 

9. Using ngrok (https://ngrok.com) you can provide public access to localhost – great for demos. 

### Deliverables: 

1. A README file with instructions on how to use the containerised application 

2. A link to the code repository. 

### Evaluation Criteria: 

1. A well-structured README file that guides users on how to use any Dockerfiles and the docker-compose.yml file. 

2. A working containerised application 

3. A great demo after the holidays! 

