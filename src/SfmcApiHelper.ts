'use strict';
import path = require("path");
import axios from 'axios';
import express = require("express");
import Utils from './Utils';

export default class SfmcApiHelper

{
  private isAccessToken = false;
    // Instance variables
    private _deExternalKey = "DF18Demo";
    private _sfmcDataExtensionApiUrl = "https://www.exacttargetapis.com/hub/v1/dataevents/key:" + this._deExternalKey + "/rowset";

    /**
     * getOAuthAccessToken: POSTs to SFMC Auth URL to get an OAuth access token with the given ClientId and ClientSecret
     * 
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     * 
     */
     public getAuthorizationCode(
      clientId: string,
      clientSecret: string,
      redirectURL: string
    ): Promise<any> {
      let self = this;
      return self.getAuthorizationCodeHelper(clientId, redirectURL);
    }
  
    /**
     * getAuthorizationCodeHelper: Helper method to get auth code
     *
     */
    public getAuthorizationCodeHelper(
      clientId: any,
      redirectURL: any
    ): Promise<any> {
      return new Promise<any>((resolve, reject) => {
        let sfmcAuthServiceApiUrl =
          "https://" +
          process.env.BASE_URL +
          ".auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id=" +
          clientId +
          "&redirect_uri=" +
          redirectURL +
          "&state=mystate";
        //https://YOUR_SUBDOMAIN.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id=vqwyswrlzzfk024ivr682esb&redirect_uri=https%3A%2F%2F127.0.0.1%3A80%2F
        axios
          .get(sfmcAuthServiceApiUrl)
          .then((response: any) => {
            resolve({
              statusText: response.data,
            });
          })
          .catch((error: any) => {
            // error
            let errorMsg = "Error getting Authorization Code.";
            errorMsg += "\nMessage: " + error.message;
            errorMsg +=
              "\nStatus: " + error.response ? error.response.status : "<None>";
            errorMsg +=
              "\nResponse data: " + error.response
                ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
                : "<None>";
            Utils.logError(errorMsg);
  
            reject(errorMsg);
          });
      });
    }
    
     public getOAuthAccessToken(
      clientId: string,
      clientSecret: string,
      req: any,
      res: any
    ): Promise<any> {
      let self = this;
      var tssd = "";
      
      tssd = req.body.tssd ? req.body.tssd : process.env.BASE_URL;
      console.log("authorizetssd:" + tssd);
      let headers = {
        "Content-Type": "application/json",
      };
  
      let postBody = {
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: req.body.authorization_code,
        redirect_uri: process.env.REDIRECT_URL,
      };
       
      console.log("response:",res);
      return self.getOAuthTokenHelper(headers, postBody, res, tssd);
    }
  
    /**
     * getOAuthTokenHelper: Helper method to POST the given header & body to the SFMC Auth endpoint
     *
     */
    public getOAuthTokenHelper(
      headers: any,
      postBody: any,
      res: any,
      tssd: string
    ): Promise<any> {
      return new Promise<any>((resolve, reject) => {
        console.log("author" + JSON.stringify(tssd));
        let sfmcAuthServiceApiUrl =
          "https://" + tssd + ".auth.marketingcloudapis.com/v2/token";
        this.isAccessToken = true;
        console.log("sfmcAuthServiceApiUrl:" + sfmcAuthServiceApiUrl);
        axios
          .post(sfmcAuthServiceApiUrl, postBody, { headers: headers })
          .then((response: any) => {
            let refreshToken = response.data.refresh_token;
            this.getRefreshTokenHelper(refreshToken, tssd, true, res);
          })
          .catch((error: any) => {
            // error
            let errorMsg = "Error getting OAuth Access Token.";
            errorMsg += "\nMessage: " + error.message;
            errorMsg +=
              "\nStatus: " + error.response ? error.response.status : "<None>";
            errorMsg +=
              "\nResponse data: " + error.response
                ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
                : "<None>";
            Utils.logError(errorMsg);
  
            reject(errorMsg);
          });
      });
    }
  
    //Helper method to get refresh token
    public getRefreshTokenHelper(
      refreshToken: string,
      tssd: string,
      returnResponse: boolean,
      res: any
    ): Promise<any> {
      return new Promise<any>((resolve, reject) => {
        console.log("tssdrefresh:" + tssd);
        console.log("returnResponse:" + returnResponse);
  
        let sfmcAuthServiceApiUrl =
          "https://" + tssd + ".auth.marketingcloudapis.com/v2/token";
        let headers = {
          "Content-Type": "application/json",
        };
        console.log("sfmcAuthServiceApiUrl:" + sfmcAuthServiceApiUrl);
        let postBody1 = {
          grant_type: "refresh_token",
          client_id: process.env.CLIENTID,
          client_secret: process.env.CLIENTSECRET,
          refresh_token: refreshToken,
        };
        axios
          .post(sfmcAuthServiceApiUrl, postBody1, { headers: headers })
          .then((response: any) => {
            let bearer = response.data.token_type;
            let tokenExpiry = response.data.expires_in;
            // this._accessToken = response.data.refresh_token;
            //this._oauthToken = response.data.access_token;
            Utils.logInfo("Auth Token:" + response.data.access_token);
            const customResponse = {
              refreshToken: response.data.refresh_token,
              oauthToken: response.data.access_token,
            };
            if (returnResponse) {
              res.status(200).send(customResponse);
            }
            resolve(customResponse);
          })
          .catch((error: any) => {
            let errorMsg = "Error getting refresh Access Token.";
            errorMsg += "\nMessage: " + error.message;
            errorMsg +=
              "\nStatus: " + error.response ? error.response.status : "<None>";
            errorMsg +=
              "\nResponse data: " + error.response
                ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
                : "<None>";
            Utils.logError(errorMsg);
  
            reject(errorMsg);
          });
      });
    }
  
    //Fetching the app user information
    public appUserInfo(req: any, res: any) {
      let self = this;
      console.log("req.body.tssd:" + req.body.tssd);
      console.log("req.body.trefreshToken:" + req.body.refreshToken);
      let userInfoUrl =
        "https://" + req.body.tssd + ".auth.marketingcloudapis.com/v2/userinfo";
      let access_token: string;
  
      self
        .getRefreshTokenHelper(req.body.refreshToken, req.body.tssd, false, res)
        .then((response) => {
          Utils.logInfo(
            "refreshTokenbody:" + JSON.stringify(response.refreshToken)
          );
          Utils.logInfo("AuthTokenbody:" + JSON.stringify(response.oauthToken));
          access_token = response.oauthToken;
          const refreshTokenbody = response.refreshToken;
          Utils.logInfo("refreshTokenbody1:" + JSON.stringify(refreshTokenbody));
          let headers = {
            "Content-Type": "application/json",
            Authorization: "Bearer " + response.oauthToken,
          };
          axios
            .get(userInfoUrl, { headers: headers })
            .then((response: any) => {
              const getUserInfoResponse = {
                member_id: response.data.organization.member_id,
                soap_instance_url: response.data.rest.soap_instance_url,
                rest_instance_url: response.data.rest.rest_instance_url,
                refreshToken: refreshTokenbody,
              };
  
              //Set the member_id into the session
              console.log("Setting active sfmc mid into session:" + getUserInfoResponse.member_id);
              req.session.sfmcMemberId = getUserInfoResponse.member_id;
              //this.CheckAutomationStudio(access_token, req.body.refreshToken, req.body.tssd, getUserInfoResponse.member_id);
              res.status(200).send(getUserInfoResponse);
            })
            .catch((error: any) => {
              // error
              let errorMsg = "Error getting User's Information.";
              errorMsg += "\nMessage: " + error.message;
              errorMsg +=
                "\nStatus: " + error.response ? error.response.status : "<None>";
              errorMsg +=
                "\nResponse data: " + error.response
                  ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
                  : "<None>";
              Utils.logError(errorMsg);
  
              res
                .status(500)
                .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
            });
        })
        .catch((error: any) => {
          res
            .status(500)
            .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
        });
    }
    
  }
//     public creatingDomainConfigurationDE(
//         req: express.Request,
//         res: express.Response,
//         member_id: string,
//         soap_instance_url: string,
//         refreshToken: string,
//         FolderID: string,
//         tssd: string
//       ) {
//         //this.getRefreshTokenHelper(this._accessToken, res);
//         console.log("creatingDomainConfigurationDE:" + member_id);
//         console.log("creatingDomainConfigurationDE:" + soap_instance_url);
//         console.log("creatingDomainConfigurationDE:" + refreshToken);
//         Utils.logInfo("creatingDomainConfigurationDE:" + FolderID);
//         console.log("creatingDomainConfigurationDE:" + tssd);
    
//         //console.log('domainConfigurationDECheck:'+req.body.ParentFolderID);
    
//         let refreshTokenbody = "";
//         this.getRefreshTokenHelper(refreshToken, tssd, false, res)
//           .then((response) => {
//             Utils.logInfo(
//               "creatingDomainConfigurationDE:" +
//               JSON.stringify(response.refreshToken)
//             );
//             Utils.logInfo(
//               "creatingDomainConfigurationDE:" + JSON.stringify(response.oauthToken)
//             );
//             refreshTokenbody = response.refreshToken;
//             Utils.logInfo(
//               "creatingDomainConfigurationDE1:" + JSON.stringify(refreshTokenbody)
//             );
    
//             let DCmsg =
//               '<?xml version="1.0" encoding="UTF-8"?>' +
//               '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
//               "    <s:Header>" +
//               '        <a:Action s:mustUnderstand="1">Create</a:Action>' +
//               '        <a:To s:mustUnderstand="1">' +
//               soap_instance_url +
//               "Service.asmx" +
//               "</a:To>" +
//               '        <fueloauth xmlns="http://exacttarget.com">' +
//               response.oauthToken +
//               "</fueloauth>" +
//               "    </s:Header>" +
//               '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
//               '        <CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
//               '            <Objects xsi:type="DataExtension">' +
//               "                <CategoryID>" +
//               FolderID +
//               "</CategoryID>" +
//               "                <CustomerKey>Domain Configuration-" +
//               member_id +
//               "</CustomerKey>" +
//               "                <Name>Domain Configuration-" +
//               member_id +
//               "</Name>" +
//               "                <Fields>" +
//               "                    <Field>" +
//               "                        <CustomerKey>Name</CustomerKey>" +
//               "                        <Name>Name</Name>" +
//               "                        <FieldType>Text</FieldType>" +
//               "                        <MaxLength>100</MaxLength>" +
//               "                        <IsRequired>true</IsRequired>" +
//               "                        <IsPrimaryKey>false</IsPrimaryKey>" +
//               "                    </Field>" +
//               "                    <Field>" +
//               "                        <CustomerKey>Phone Number</CustomerKey>" +
//               "                        <Name>Phone Number</Name>" +
//               "                        <FieldType>Text</FieldType>" +
//               "                        <MaxLength>100</MaxLength>" +
//               "                        <IsRequired>true</IsRequired>" +
//               "                        <IsPrimaryKey>true</IsPrimaryKey>" +
//               "                    </Field>" +
//               "                    <Field>" +
//               "                        <CustomerKey>Position</CustomerKey>" +
//               "                        <Name>Position</Name>" +
//               "                        <FieldType>Text</FieldType>" +
//               "                        <MaxLength>50</MaxLength>" +
//               "                        <IsRequired>false</IsRequired>" +
//               "                        <IsPrimaryKey>false</IsPrimaryKey>" +
//               "                    </Field>" +
//               "                    <Field>" +
//               "                        <CustomerKey>Years of Experience</CustomerKey>" +
//               "                        <Name>Years of Experience</Name>" +
//               "                        <FieldType>Text</FieldType>" +
//               "                        <MaxLength>10</MaxLength>" +
//               "                        <IsRequired>false</IsRequired>" +
//               "                        <IsPrimaryKey>false</IsPrimaryKey>" +
//               "                    </Field>" +
//               "                    
//               "                </Fields>" +
//               "            </Objects>" +
//               "        </CreateRequest>" +
//               "    </s:Body>" +
//               "</s:Envelope>";
    
//             return new Promise<any>((resolve, reject) => {
//               let headers = {
//                 "Content-Type": "text/xml",
//               };
    
//               axios({
//                 method: "post",
//                 url: "" + soap_instance_url + "Service.asmx" + "",
//                 data: DCmsg,
//                 headers: headers,
//               })
//                 .then((response: any) => {
//                   var parser = new xml2js.Parser();
//                   parser.parseString(
//                     response.data,
//                     (
//                       err: any,
//                       result: {
//                         [x: string]: {
//                           [x: string]: { [x: string]: { [x: string]: any }[] }[];
//                         };
//                       }
//                     ) => {
//                       let DomainConfiguration =
//                         result["soap:Envelope"]["soap:Body"][0][
//                         "CreateResponse"
//                         ][0]["Results"];
    
//                       if (DomainConfiguration != undefined) {
//                         let DEexternalKeyDomainConfiguration =
//                           DomainConfiguration[0]["Object"][0]["CustomerKey"];
    
//                         //this.DEexternalKeyDomainConfiguration =
//                         // DomainConfiguration[0]["Object"][0]["CustomerKey"];
//                         let sendresponse = {};
//                         sendresponse = {
//                           refreshToken: refreshTokenbody,
//                           statusText:
//                             "Domain Configuration Data extension has been created Successfully",
//                           soap_instance_url: soap_instance_url,
//                           member_id: member_id,
//                           DEexternalKeyDomainConfiguration:
//                             DEexternalKeyDomainConfiguration,
//                         };
//                         res.status(200).send(sendresponse);
    
//                         /*  res
//                       .status(200)
//                       .send(
//                         "Domain Configuration Data extension has been created Successfully"
//                       );*/
//                       }
//                     }
//                   );
//                 })
//                 .catch((error: any) => {
//                   // error
//                   let errorMsg =
//                     "Error creating the Domain Configuration Data extension......";
//                   errorMsg += "\nMessage: " + error.message;
//                   errorMsg +=
//                     "\nStatus: " + error.response
//                       ? error.response.status
//                       : "<None>";
//                   errorMsg +=
//                     "\nResponse data: " + error.response.data
//                       ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
//                       : "<None>";
//                   Utils.logError(errorMsg);
    
//                   reject(errorMsg);
//                 });
//             });
//           })
//           .catch((error: any) => {
//             res
//               .status(500)
//               .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
//           });
//       }
// }