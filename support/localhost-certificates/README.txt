The certificate and ca files located here allow develepors to install a trusted
localhost ssl cert.  This allows developers to run ssl secured servers in their
local dev environment without getting invalid cert warnings in their browser
when using https connections.

For any cert to be considered valid by a browser it must have a Certificate
Authority(CA) registered with the computer.  The rootCA.pem file provides
a valid CA cert that can be installed locally.  The easiest way to install
the CA is to use the mkcert tool which can be downloaded here:

    https://github.com/FiloSottile/mkcert/releases

It can also be installed using tools like homebrew, chocolatey, and various
linux package managers.  Installation instructions can be found here:

    https://github.com/FiloSottile/mkcert

Once you have the mkcert tool installed the caRoot.pem file can be installed
as follows:

1. Open an admin command line
2. Set the environment variable CAROOT to the path of this directory
   CAROOT=pfm-server/support/cert
3. Run mkcert -install
   You should be prompted about installing a cert from PEXCHANGE-DEV
   The Thumbprint should be:
       49:C0:B4:E8:47:D7:4B:1B:8C:DB:5F:DD:FC:80:90:BF:84:28:AB:4F
    If the name and thumbprint match then click yes to install the CA cert
4. Upon success you should see successful installation messages
5. There are also manual ways to install this CA cert depending upon OS.
   If you wish to attempt doing this manually please follow your OS
   documentation.

Create/update localhost certs
1. Run mkcert -cert-file p-exchange.localhost.cert.pem -key-file p-exchange.localhost.key.pem
2. Run mkcert -pkcs12
3. Rename generated .p12 file to p-exchange.localhost.p12
4. Copy updated certs to required places
