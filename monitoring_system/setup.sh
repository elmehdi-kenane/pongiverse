#!/bin/bash

if [ ! -d "./archive" ]; then
    mkdir archive
fi
if [ ! -d "./tools" ]; then
    mkdir tools
fi

echo -e "\033[1;34m ============ Wget 🌐 ============\033[0m"
if command -v wget >/dev/null 2>&1; then
    echo -e "\033[1;34m ============ Wget already downloaded 💯 ============\033[0m"
else
    echo -e "\033[1;34m ============ Wget downloading ⏳... ============\033[0m"
    apt update && apt install -y wget
    echo -e "\033[1;34m ============ Wget downloaded 🔰 ============\033[0m"
fi
echo -e ""

if [ ! -d "./logs" ]; then
    mkdir logs
fi

echo -e "\033[1;34m ============ Prometheus 🌐 ============\033[0m"
if [ -d "./tools/prometheus" ]; then
    echo -e "\033[1;34m ============ Prometheus already downloaded 💯 ============\033[0m"
else
    echo -e "\033[1;34m ============ Prometheus downloading ⏳... ============\033[0m"
    wget -q https://github.com/prometheus/prometheus/releases/download/v2.55.1/prometheus-2.55.1.linux-amd64.tar.gz
    echo -e "\033[1;34m ============ Prometheus downloaded 🔰 ============\033[0m"
    mv prometheus-2.55.1.linux-amd64.tar.gz prometheus.tar.gz
    tar xfz prometheus.tar.gz

    mv prometheus.tar.gz archive
    mv prometheus-2.55.1.linux-amd64 tools/prometheus
fi
echo -e "\033[1;34m ============ Prometheus started ✅ ============\033[0m"
envsubst < config/prometheus/prometheus.yml.template > config/prometheus/prometheus.yml
./tools/prometheus/prometheus --config.file="config/prometheus/prometheus.yml" --storage.tsdb.path="./tools/prometheus/data" > logs/prometheus_logs 2>&1 &
echo -e "\033[1;34m ============ see ./logs/prometheus_logs ============\033[0m"
echo -e ""

sleep 2

echo -e "\033[1;34m ============ Alertmanager 🌐 ============\033[0m"
if [ -d "./tools/alertmanager" ]; then
    echo -e "\033[1;34m ============ Alertmanager already downloaded 💯 ============\033[0m"
else
    echo -e "\033[1;34m ============ Alertmanager downloading ⏳... ============\033[0m"
    wget -q https://github.com/prometheus/alertmanager/releases/download/v0.28.0-rc.0/alertmanager-0.28.0-rc.0.linux-amd64.tar.gz
    echo -e "\033[1;34m ============ Alertmanager downloaded 🔰 ============\033[0m"
    mv alertmanager-0.28.0-rc.0.linux-amd64.tar.gz alertmanager.tar.gz
    tar xfz alertmanager.tar.gz

    mv alertmanager.tar.gz archive
    mv alertmanager-0.28.0-rc.0.linux-amd64 tools/alertmanager
fi

echo -e "\033[1;34m ============ Alertmanager  ============\033[0m"
envsubst < config/alertmanager/alertmanager.yml.template > config/alertmanager/alertmanager.yml
./tools/alertmanager/alertmanager --config.file="config/alertmanager/alertmanager.yml" > logs/alertmanager_logs 2>&1 &
echo -e "\033[1;34m ============ see ./logs/alertmanager_logs ============\033[0m"
echo -e ""

sleep 2

rm -rf ./data

echo -e "\033[1;34m ============ NodeExporter 🌐 ============\033[0m"
if [ -d "./tools/node_exporter" ]; then
    echo -e "\033[1;34m ============ NodeExporter already downloaded 💯 ============\033[0m"
else
    echo -e "\033[1;34m ============ NodeExporter downloading ⏳... ============\033[0m"
    wget -q https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-amd64.tar.gz
    echo -e "\033[1;34m ============ NodeExporter downloaded 🔰 ============\033[0m"
    mv node_exporter-1.8.2.linux-amd64.tar.gz node_exporter.tar.gz
    tar xfz node_exporter.tar.gz

    mv node_exporter.tar.gz archive
    mv node_exporter-1.8.2.linux-amd64 tools/node_exporter
fi


./tools/node_exporter/node_exporter > logs/node_exporter_logs 2>&1 &
echo -e "\033[1;34m ============ see ./logs/node_exporter_logs ============\033[0m"
echo -e ""

sleep 2


if [ -d "./tools/grafana" ]; then
    echo -e "\033[1;34m ============ Grafana already downloaded 💯 ============\033[0m"
else
    echo -e "\033[1;34m ============ Grafana downloading ⏳... ============\033[0m"
    wget -q https://dl.grafana.com/oss/release/grafana-11.3.0.linux-amd64.tar.gz
    echo -e "\033[1;34m ============ Grafana downloaded 🔰 ============\033[0m"
    mv grafana-11.3.0.linux-amd64.tar.gz grafana.tar.gz
    tar xfz grafana.tar.gz

    mv grafana.tar.gz archive
    mv grafana-v11.3.0 tools/grafana
fi


GRAFANA_DATA_DIRECTORY="../../grafana_data"
DEFAULTS_GRAFANA_INI="tools/grafana/conf/defaults.ini"


sed -i "s|^http_port *= *3000|http_port = 3030|" $DEFAULTS_GRAFANA_INI
sed -i "s|^protocol *= *http|protocol = https|" $DEFAULTS_GRAFANA_INI
sed -i "s|^cert_file *= *3000|cert_file = /etc/grafana/grafana.crt|" $DEFAULTS_GRAFANA_INI
sed -i "s|^cert_key *= *3000|cert_key = /etc/grafana/grafana.key|" $DEFAULTS_GRAFANA_INI
echo "Grafana port changed from 3000 to 3030" > logs/grafana_logs
sed -i "s|^data = data|data = $GRAFANA_DATA_DIRECTORY|" $DEFAULTS_GRAFANA_INI
sed -i "s|^logs = data/log|logs = $GRAFANA_DATA_DIRECTORY/log|" $DEFAULTS_GRAFANA_INI
sed -i "s|^path = data/log|path = $GRAFANA_DATA_DIRECTORY/log|" $DEFAULTS_GRAFANA_INI
echo "Grafana-Data-Directory changed to $GRAFANA_DATA_DIRECTORY" > logs/grafana_logs

echo -e "\033[1;34m ============ Grafana started ✅ ============\033[0m"
envsubst < config/grafana/datasources.yaml.template > config/grafana/datasources.yaml
./tools/grafana/bin/grafana server --homepath ./tools/grafana/ > logs/grafana_logs 2>&1 &
echo -e "\033[1;34m ============ see ./logs/grafana_logs ============\033[0m"
echo -e ""

wait
