const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const client = new SESClient({ region: "eu-north-1" });

const command = new SendEmailCommand({
    Source: "aryan@bansalapp.digital",
    Destination: {
      // ToAddresses: ["bansalaryan2929@gmail.com"],
      ToAddresses: ["sakshi.koli@contentstack.com"],
    },
    Message: {
      Subject: { Data: "Click tracking test v3 with vinesh sir" },
      Body: {
        Html: {
          Data: `
            <h1>Click tracking test</h1>
            <a href="marketplace.bansalapp.digital">Link 1</a><br/><br/>
          `,
        },
      },
    },
    ConfigurationSetName: "bansalapp-config",
  });

client.send(command)
  .then((res) => console.log("Email sent! Message ID:", res.MessageId))
  .catch((err) => console.error("Error:", err));