# Prerequisite

You need :
- node 22
- make

# Installation

On root folder use the commands :
```
make i-cert
```
This will generate the certificate for local https (**https is needed for features of webRTC**)

On local, once you launch the server it is imperative that you go to the backend https server.
The goal is to accept to continue into the website, this will allow you (therefore your frontend project) to connect despite the unsecure / localy generated ssl certificate