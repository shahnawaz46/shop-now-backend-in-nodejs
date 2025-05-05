const appName = 'ShopNow';

export const registrationVerificationEmail = (otp) => {
  return `<!DOCTYPE >
    <html xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your login</title>
      <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
    </head>
    
    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
      <table role="presentation"
        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
        <tbody>
          <tr>
            <td align="center" style="padding: 1rem 0.5rem; vertical-align: top; width: 100%;">
              <table role="presentation" style="max-width: 800px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                <tbody>
                  <tr>
                    <td style="padding: 40px 0px 0px;">
                      <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                        <div style="color: rgb(0, 0, 0); text-align: left;">
                          <h1 style="margin: 1rem 0">Verification code</h1>
                          <p style="padding-bottom: 16px; font-size:16px">Please use the verification code below for registration.</p>
                          <p style="padding-bottom: 16px"><strong style="font-size: 22px">${otp}</strong></p>
                          <p style="padding-bottom: 16px; font-size:15px">If you didn't request this, you can ignore this email.</p>
                          <p style="padding-bottom: 16px; font-size:15px">Thanks,<br><span style="color: #999">${appName} Team</span></p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    
    </html>`;
};

export const thankForRegistration = (fullName) => {
  return `<!DOCTYPE >
    <html xmlns="http://www.w3.org/1999/xhtml">
  
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to GuardVault</title>
      <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
    </head>
    
    <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
      <table role="presentation"
        style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
        <tbody>
          <tr>
            <td align="center" style="padding: 1rem 0.5rem; vertical-align: top; width: 100%;">
              <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                <tbody>
                  <tr>
                    <td style="padding: 40px 0px 0px;">
                      <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                        <div style="color: rgb(0, 0, 0); text-align: left;">
                          <h1 style="margin: 1rem 0; font-size:25px">Welcome to ${appName}</h1>
                          <p style="padding-bottom: 16px; font-size:17px">Hello ${fullName},</p>
                          <p style="padding-bottom: 16px; font-size:16px">Thank you for signing up to ${appName}. We're really happy to have you onboard</p>
                          <p style="padding-bottom: 16px; font-size:16px">We're here to help you every step of the way. If you have any questions, please don't
                            hesitate to contact our support team at <a href="mailto:shahnawaz85748@gmail.com" target="_blank"
                              style="text-decoration: none;">shahnawaz85748@gmail.com</a></p>
                          <p style="padding-bottom: 16px; font-size:15px">Best regards,<br><span style="color: #999">${appName} Team</span></p>
                        </div>
                      </div>
                     
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    
    </html>`;
};
