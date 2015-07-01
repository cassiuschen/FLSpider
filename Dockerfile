FROM ubuntu:14.04
MAINTAINER cassiuschen "chzsh1995@gmail.com"

RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get -y install gcc g++ make automake autoconf curl wget git-core
WORKDIR /var
RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
RUN apt-get install -y nodejs build-essential
EXPOSE 22
EXPOSE 80
EXPOSE 3000
EXPOSE 3001

RUN mkdir -pv /var/data
WORKDIR /var/data

ADD ./ /var/data/spider
WORKDIR /var/data/spider
RUN mkdir -pv log
RUN npm install --verbose