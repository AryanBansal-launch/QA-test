const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const client = new SESClient({ region: "eu-north-1" });

const command = new SendEmailCommand({
    Source: "aryan@bansalapp.digital",
    Destination: {
      ToAddresses: ["bansalaryan2929@gmail.com"],
    },
    Message: {
      Subject: { Data: "Click tracking test v3" },
      Body: {
        Html: {
          Data: `
            <h1>Click tracking test</h1>
            <a href="https://bansalapp.digital">Link 1</a><br/><br/>
            <a href="https://marketplace.bansalapp.digital">Link 2</a>
          `,
        },
      },
    },
    ConfigurationSetName: "bansalapp-config",
  });

client.send(command)
  .then((res) => console.log("Email sent! Message ID:", res.MessageId))
  .catch((err) => console.error("Error:", err));