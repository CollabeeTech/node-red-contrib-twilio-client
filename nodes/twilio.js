module.exports = function(RED) {
    function RdStationClientNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        const axios = require('axios');

        node.on('input', async function(msg) {
            try {
                const action = config.action || msg.action;
                const credential = config.credential || msg.credential;
                const from = msg.payload.from;
                const to = msg.payload.to;
                const templateParameters = msg.payload.templateParameters;
                const accountSid = msg.payload.accountSid;
                const contentSid = msg.payload.contentSid;
                const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
                const method = 'POST';

                if (!url || !credential || !action) {
                    node.error("URL, credenciais ou ação não definidos", msg);
                    return;
                }

                const headers = {
                    'Authorization': `Basic ${credential}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                };

                const formData = new URLSearchParams();
                formData.append('From', `whatsapp:${from}`);
                formData.append('To', `whatsapp:${to}`);
                formData.append('TemplateParameters', JSON.stringify(templateParameters));
                formData.append('ContentSid', contentSid);

                let axiosConfig = {
                    method: method,
                    url: url,
                    headers: headers,
                    data: formData.toString()
                };

                const response = await axios(axiosConfig);

                if (response.status >= 200 && response.status < 300) {
                    msg.payload = {
                        status: "success",
                        response: response.data || {}
                    };
                } else {
                    msg.payload = {
                        status: "error",
                        response: response.data || {}
                    };
                }

                node.send(msg);

            } catch (error) {
                node.error("Erro ao conectar à API Twilio: " + error.message, msg);
            }
        });
    }
    RED.nodes.registerType("twilio", RdStationClientNode);
}
