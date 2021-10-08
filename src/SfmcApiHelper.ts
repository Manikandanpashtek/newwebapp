'use strict';

import axios from 'axios';
import express = require("express");
import { request } from 'http';
import Utils from './Utils';
import xml2js = require("xml2js");
import MC_Generic_Methods from "./Generic-method/src/";
import { access } from 'fs';
import { stringify } from 'querystring';
import { resolve } from 'dns';

export default class SfmcApiHelper
{
    // Instance variables
  private client_id="";
  private client_secret="";
  // private _accessToken = "";
  private genericMethods = new MC_Generic_Methods();
  private oauthAccessToken=""; 
  private member_id = "514018007";
  private soap_instance_url = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.soap.marketingcloudapis.com/";
  private _deExternalKey = "DF20Demo";
  private _sfmcDataExtensionApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.rest.marketingcloudapis.com/hub/v1/dataevents/key:" + this._deExternalKey + "/rowset";
  private refreshToken = "";
  private parentFolderId= "12785";
  private FolderID = "";
  private paramData="";
  
  
  private rest_instance_url = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.rest.marketingcloudapis.com/";
  private datas =[ {
    "keys":{
            "id": "47"
            },
    "values":{
            "name": "alex",
            "email": "alex@gamil.com",
            }
}]
      /**
     * getOAuthAccessToken: POSTs to SFMC Auth URL to get an OAuth access token with the given ClientId and ClientSecret
     * 
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     * 
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

    return self.getOAuthTokenHelper(headers, postBody, res, tssd);
  }

  /**
   * getOAuthTokenHelper: Helper method to POST the given header & body to the SFMC Auth endpoint
   *
   */
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

    return self.getOAuthTokenHelper(headers, postBody, res, tssd);
  }

  public getOAuthTokenHelper(
    headers: any,
    postBody: any,
    result: express.Response,
    tssd: string
  ): Promise<any> {

    this.genericMethods
      .getOAuthAccessToken(
        postBody.client_id,
        postBody.client_secret,
        postBody.grant_type,
        postBody.code,
        postBody.redirect_uri
      )
      .then((res: any) => {
        console.log("AccessToken Method from library", res.data.refresh_token);
        this.refreshToken = res.data.refresh_token;
        this.oauthAccessToken = res.data.oauthAccessToken
        console.log("tokken tokken>>",this.refreshToken); 
        console.log("AccessToken Method  library", res);
        result.status(200).send(res) 
        
        // if (res.data.refresh_token) {
        //   console.log(
        //     "Refresh token",
        //     this.refreshToken,
        //     "Refresh token from response",
        //     res.data.refresh_token
        //   );
        // }
          this.genericMethods
            .getRefreshToken(
              this.refreshToken,
              process.env.BASE_URL,
              postBody.client_id,
              postBody.client_secret
            )
           
            .then((response:any)=>
            {
              console.log("Response to send:",response);
            })
            .catch((err)=>
            {
              console.log(err)
            })   
          
    })
    .catch((err)=>
    {
      console.error(err)      
    })
   
    return
  }    
     public appUserInfo(req: any, res: any) {
                let self = this;
                console.log("req.body.tssd:" + req.body.tssd);
                console.log("req.body.trefreshToken:" + req.body.refreshToken);
                let access_token: string;
                this.genericMethods
                .userInfo(
                  process.env.BASE_URL,
                  this.oauthAccessToken
                )
                .then((response:any)=>
                {
                  console.log("UserInfo::>>",response);
                  res.status(200).send(response)
              })
              .catch((err:any)=>
              {
                console.log(err)
              })
              
                  
              }

        public senderdomain(req:any,res:any)
        {
          this.genericMethods
          .getSenderDomain(this.paramData)
          .then((response: any) => {
            console.log(
              "Sender Domain Response (Domain Name)::: " + JSON.stringify(response.domainName)  
            );
            res.status(200).send(response)
            })
            .catch((err: any) => {
              console.error(
                "error getting Sender Domain from library" + err
              );
            });
        }
        
        // public createFolder(req:any,res:any)    
        // {
        //   this.genericMethods
        //   .createFolder( 
        //     this.paramData.oauthToken,
        //    response.soap_instance_url,
        //    response.member_id,
        //    this.parentFolderId
        //     )
        //   .then((response:any)=>
        //   {
        //     console.log("Data Extension Created...Check MC App");
        //     res.status(200).send(response)
        //   }
        //   )
         

        //   .catch((err:any)=>
        //   {
        //     console.error("Error in creating folder",err)
        //   })
        // }           
             

        //        public getActiveJourney(req:any,res:any)
        //        {
        //         this.genericMethods
        //         .getActiveJourney(
        //           paramData.oauthToken,
        //           process.env.BASE_URL
        //         )
        //         .then((response:any)=>
        //         {
        //           console.log("Active Journeys:>>>:",JSON.stringify(response));
        //           res.status(200).send(response)
        //         })
        //         .catch((err:any)=>
        //         {
        //           console.error(err)
        //         })
        //        }
               
               
        //        public getJourneyDetails(req:any,res:any)
        //        {
        //         this.genericMethods
        //         .getJourneyDetails(
        //           paramData.oauthToken,
        //           process.env.BASE_URL
        //         )
        //         .then((response:any)=>
        //         {
        //           console.log("Journey Details:>>>:",JSON.stringify(response));
        //           res.status(200).send(response)
        //         })
        //         .catch((err:any)=>
        //         {
        //           console.error(err)
        //         })
        //        }
              
        //       public dataFolderCheck(req:any,res:any)
        //       {
        //         this.genericMethods
        //         .dataFolderCheck(
        //           paramData.oauthToken,
        //           response.soap_instance_url,
        //           response.member_id
        //         )
        //         .then((response:any)=>
        //         {
        //           console.log("Response in dataFolderCheck >>>",response)
        //           console.log("Folder id in use:",response.FolderID)
        //            this.FolderID = response.FolderID
        //            console.log(this.FolderID) 
        //            console.log("FOlderID got!!")
        //            res.status(200).send(response)
 
 
        //            const jsonArr=[
        //              {
        //                name:"LibraryName",
        //                type:"text",
        //                length:100,
        //                isReq:true,
        //                isKey:true
        //              },
        //              {
        //                name:"LibraryModules",
        //                type:"decimal",
        //                precision:20,
        //                scale:0,
        //                isReq:true,
        //                isKey:false
        //              }, 
        //              {
        //                name:"LibraryScale",
        //                type:"number",
        //                length:20,
        //                isReq:true,
        //                isKey:false
        //              },
        //              {
        //                name:"Email",
        //                type:"Email Address",
        //                isReq:true,
        //                isKey:false
        //              }
        //            ]
        //          })
        //          .catch((err)=>
        //          {
        //            console.error(err)
        //          })
        //       }
               
                
            

        //   public createDataExtension(req:any,res:any)
        //   {
        //     this.genericMethods
        //     .createDataExtension
        //     (
        //       response.member_id,
        //      response.soap_instance_url,
        //      paramData.oauthToken,
        //      this.FolderID,
        //      process.env.BASE_URL,
        //      jsonArr
        //     )
        //     .then((response:any)=>
        //     {
        //       console.log("<><><Response in creating Data xtension><><>",response)
        //       res.status(200).send(response)
              
        //     })
        //     .catch((err:any)=>
        //     {
        //       console.log("Erroe in creatong data extension in folder",err)
        //     })
        //   }
                  
              

        //       public retrieveDataExtensionRows(req:any,res:any)
        //       {
        //         this.genericMethods
        //         .retrievingDataExtensionRows( paramData.oauthToken,
        //           response.soap_instance_url,
        //           response.member_id,
        //           this.parentFolderId)
                  
        //         .then((response:any)=>
        //         {
        //           console.log("<<<<success>>>>");
                  
        //           console.log("Journey Details:>>>:",JSON.stringify(response));
        //           res.status(200).send(response)
        //         })

        //         .catch((err:any)=>
        //         {
        //           console.error(err)
        //         })
        //       }
              
        //     public insertRow(req:any,res:any)
        //     {
        //       this.genericMethods
        //       .insertRowHelper(paramData.oauthToken,this.rest_instance_url,this._deExternalKey,this.datas)
                
        //       .then((response:any)=>
        //       {
        //         console.log("<<<<success>>>>");
        //         console.log("insert data:>>>:",JSON.stringify(response));
        //         res.status(200).send(response)
        //       })
        //       .catch((err:any)=>
        //       {
        //         console.error(err)
        //       })
           
        //     }      
            
 }