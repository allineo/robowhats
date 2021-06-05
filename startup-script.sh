apt-get update
apt-get install -yq ca-certificates git build-essential supervisor
apt install -y chromium

mkdir /opt/nodejs
curl https://nodejs.org/dist/v16.3.0/node-v16.3.0-linux-x64.tar.gz | tar xvzf - -C /opt/nodejs --strip-components=1

ln -s /opt/nodejs/bin/node /usr/bin/node
ln -s /opt/nodejs/bin/npm /usr/bin/npm

mkdir /opt/app
cd /opt/app

GITHUB_USER='seu usuario do github aqui'
GITHUB_PASSWORD='sua senha do github aqui'
GITHUB_REPO='robowhats'
git clone https://${GITHUB_USER}:${GITHUB_PASSWORD}@github.com/${GITHUB_USER}/${GITHUB_REPO}
cd ${GITHUB_REPO}

npm install
nohup npm start &