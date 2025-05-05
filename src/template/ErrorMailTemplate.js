export const errorTemplate = (errorAPI, errorMessage) => {
  return `<!DOCTYPE >
      <html xmlns="http://www.w3.org/1999/xhtml">
    
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error for admin</title>
        <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
      </head>
      
      <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
        <table role="presentation"
          style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
          <tbody>
            <tr>
              <td align="center" style="padding: 1rem 0.5rem; vertical-align: top; width: 100%;">
                <table role="presentation" style="max-width: 600px; min-width:350px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                  <tbody>
                    <tr>
                      <td style="padding: 40px 0px 0px;">
                        <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                          <div style="color: rgb(0, 0, 0); text-align: left;">
                            <p style="font-size:14px">API: ${errorAPI}</p>
                            <p style="padding-bottom: 16px; font-size:14px">Error Message: ${errorMessage}</p>
                            <p style="font-size:14px; color: #999">Amin Panel</p>
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
