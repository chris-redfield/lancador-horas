const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');

const {google} = require('googleapis');
const sheets = google.sheets('v4');

const app = dialogflow();

const serviceAccount = {}; // google auth json

const client = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file']
});
//console.log(client);

app.intent('lanca horas', (conv, {horas, datetime1,projeto}) => {
  let erro = 0;
  if (!horas) {
    erro = 1;
    conv.ask(`favor informar a quantidade de horas`);
  }
  if (!datetime1){
    erro =1;
      conv.ask(`Por favor informe a data de lançamento`);
  }
  if (!projeto){
    erro =1;
      conv.ask(`favor informar o projeto`);
  }
  if(erro === 0){
    conv.ask(`Lançando as ${horas}, para a data ${datetime1} na base de dados!`);
    
    return new Promise((resolve, reject) => {
        client.authorize((err, tokens) => {

            sheets.spreadsheets.values.append({
              auth: client,
              spreadsheetId: '1pxC0HgLuYy3A0RVF_0VpdNHqrIuKcewXXRlSpgOROyk',
              range: 'Sheet1!A1:C1',
              valueInputOption: 'USER_ENTERED',
              resource: {
                values: [
                  [`${datetime1}`,'Chris',`${projeto}`,`${horas.replace('horas', '')}`]
                ]
              }
            }, (e, reservation) => e ? reject(e) : resolve(reservation));

        });
      }).then(() => { 
	      conv.ask(`Mais alguma coisa senhor?`);
      }).catch((e) => {
       console.error('erro ao tentar salvar registro',e);
        conv.ask(`Desculpe mas tive algum problema ao lançar as horas, por favor procure o administrador`);
      });
  }
  
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);