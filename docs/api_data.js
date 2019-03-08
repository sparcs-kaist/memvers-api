define({ "api": [
  {
    "type": "delete",
    "url": "/account/:un",
    "title": "Delete account",
    "name": "DelAccount",
    "group": "Account",
    "description": "<p>Delete an existing account</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "un",
            "description": "<p>A URL encoded username</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ],
        "Error 403": [
          {
            "group": "Error 403",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Not a wheel account</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/account.js",
    "groupTitle": "Account"
  },
  {
    "type": "put",
    "url": "/account/:un",
    "title": "Create account",
    "name": "PutAccount",
    "group": "Account",
    "description": "<p>Create a new account</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "un",
            "description": "<p>A URL encoded username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>A name in Hangul</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "npass",
            "description": "<p>A password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "error",
            "description": "<p>The reason of the failure ( <code>undefined</code> if succeeded; <code>0</code> if <code>un</code> already exists; <code>1</code> if <code>npass</code> is weak; <code>2</code> if <code>name</code> or <code>npass</code> is not given)</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ],
        "Error 403": [
          {
            "group": "Error 403",
            "optional": false,
            "field": "Forbidden",
            "description": "<p>Not a wheel account</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/account.js",
    "groupTitle": "Account"
  },
  {
    "type": "post",
    "url": "/login",
    "title": "Login",
    "name": "Login",
    "group": "Auth",
    "description": "<p>Log in</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "un",
            "description": "<p>A username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "pw",
            "description": "<p>A password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/login.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/logout",
    "title": "Logout",
    "name": "Logout",
    "group": "Auth",
    "description": "<p>Log out</p>",
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/logout.js",
    "groupTitle": "Auth"
  },
  {
    "type": "get",
    "url": "/un",
    "title": "Username",
    "name": "Un",
    "group": "Auth",
    "description": "<p>Get a username</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "un",
            "description": "<p>A username</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/un.js",
    "groupTitle": "Auth"
  },
  {
    "type": "get",
    "url": "/forward",
    "title": "Get forward",
    "name": "GetForward",
    "group": "Forward",
    "description": "<p>Get a forwarding address</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "mail",
            "description": "<p>The current forwarding address</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/forward.js",
    "groupTitle": "Forward"
  },
  {
    "type": "post",
    "url": "/forward",
    "title": "Edit forward",
    "name": "PostForward",
    "group": "Forward",
    "description": "<p>Modify a forwarding address</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "mail",
            "description": "<p>A new forwarding address</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/forward.js",
    "groupTitle": "Forward"
  },
  {
    "type": "Get",
    "url": "/mailing",
    "title": "Get aliases",
    "name": "Aliases",
    "group": "Mailing",
    "description": "<p>Get a list of aliases</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "all",
            "description": "<p>A complete list of mailing lists</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "info",
            "description": "<p>A mapping from mailing lists to their descriptions</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "aliases",
            "description": "<p>A list of mailing lists, whom the user subscribed</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/mailing.js",
    "groupTitle": "Mailing"
  },
  {
    "type": "put",
    "url": "/mailing/:name",
    "title": "Create",
    "name": "Create",
    "group": "Mailing",
    "description": "<p>Create a new mailing list</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>A URL encoded name of the mailing list</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "desc",
            "description": "<p>A description for the mailing list</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "error",
            "description": "<p>The reason of the failure ( <code>undefined</code> if succeeded; <code>0</code> if <code>name</code> exists; <code>1</code> if internal server error; <code>2</code> if <code>desc</code> is not given)</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/mailing.js",
    "groupTitle": "Mailing"
  },
  {
    "type": "Post",
    "url": "/mailing",
    "title": "Edit aliases",
    "name": "Edaliases",
    "group": "Mailing",
    "description": "<p>Modify subscription</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": false,
            "field": "added",
            "description": "<p>Added mailing lists</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": false,
            "field": "removed",
            "description": "<p>Removed mailing lists</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "error",
            "description": "<p>The reason of the failure ( <code>undefined</code> if succeeded; <code>0</code> if internal server error; <code>1</code> if <code>added</code> or <code>removed</code> is not given)</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/mailing.js",
    "groupTitle": "Mailing"
  },
  {
    "type": "get",
    "url": "/nugu",
    "title": "Get nugu",
    "name": "GetNugu",
    "group": "Nugu",
    "description": "<p>Get 'nugu' data</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "obj",
            "description": "<p>'nugu' data</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "error",
            "description": "<p>The reason of the failure ( <code>undefined</code> if succeeded; <code>0</code> if the user does not exist in 'nugu'; <code>1</code> if database error)</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/nugu.js",
    "groupTitle": "Nugu"
  },
  {
    "type": "get",
    "url": "/nugu/:name",
    "title": "Get nugu by name",
    "name": "GetNuguName",
    "group": "Nugu",
    "description": "<p>Get 'nugu' data related to a given name</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>A URL encoded name for searching</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "objs",
            "description": "<p>Array of 'nugu' data</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/nugu.js",
    "groupTitle": "Nugu"
  },
  {
    "type": "post",
    "url": "/nugu",
    "title": "Edit nugu",
    "name": "PostNugu",
    "group": "Nugu",
    "description": "<p>Modify 'nugu' data</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "nobj",
            "description": "<p>An object containing new 'nugu' data</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "error",
            "description": "<p>The reason of the failure ( <code>undefined</code> if succeeded; <code>0</code> if database error <code>1</code> <code>nobj</code> is not given)</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/nugu.js",
    "groupTitle": "Nugu"
  },
  {
    "type": "post",
    "url": "/passwd",
    "title": "Passwd",
    "name": "Passwd",
    "group": "Passwd",
    "description": "<p>Change a password</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "opass",
            "description": "<p>A current password</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "npass",
            "description": "<p>A new password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "error",
            "description": "<p>The reason of the failure ( <code>undefined</code> if succeeded; <code>0</code> if <code>opass</code> is wrong; <code>1</code> if <code>npass</code> is weak)</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 401": [
          {
            "group": "Error 401",
            "optional": false,
            "field": "Unauthorized",
            "description": "<p>Not logged in</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/passwd.js",
    "groupTitle": "Passwd"
  },
  {
    "type": "put",
    "url": "/reset/:un",
    "title": "Request reset",
    "name": "Reset",
    "group": "Reset",
    "description": "<p>Send a reset request</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "un",
            "description": "<p>A URL encoded username for reset</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/reset.js",
    "groupTitle": "Reset"
  },
  {
    "type": "post",
    "url": "/reset/:serial",
    "title": "Reset password",
    "name": "ResetP",
    "group": "Reset",
    "description": "<p>Reset the password of an account related to a serial number</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "serial",
            "description": "<p>A URL encoded serial number</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "npass",
            "description": "<p>A new password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "error",
            "description": "<p>The reason of the failure ( <code>undefined</code> if succeeded; <code>0</code> if <code>serial</code> is wrong; <code>1</code> if <code>npass</code> is weak; <code>2</code> if internal server error)</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/reset.js",
    "groupTitle": "Reset"
  },
  {
    "type": "get",
    "url": "/reset/:serial",
    "title": "Check reset",
    "name": "ResetS",
    "group": "Reset",
    "description": "<p>Check validity of a reset serial number</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "serial",
            "description": "<p>A URL encoded serial number</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "success",
            "description": "<p>Indicate whether succeeded</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "result",
            "description": "<p>Indicate validity</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routers/reset.js",
    "groupTitle": "Reset"
  }
] });
