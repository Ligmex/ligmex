export type AccessToken = {
   accessToken: string;
   refreshToken: string;
}

export type AuthenticateResponse = {
  data: {
   authenticate: AccessToken;
  }
}
