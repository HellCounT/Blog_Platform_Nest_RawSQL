
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/": {
        "get": {
          "operationId": "AppController_getHello",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/testing/all-data": {
        "delete": {
          "operationId": "AppController_deleteAllData",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/login": {
        "post": {
          "operationId": "AuthController_login",
          "parameters": [
            {
              "name": "user-agent",
              "required": true,
              "in": "header",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputLoginUserDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/auth/logout": {
        "post": {
          "operationId": "AuthController_logout",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/refresh-token": {
        "post": {
          "operationId": "AuthController_updateRefreshToken",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/auth/registration": {
        "post": {
          "operationId": "AuthController_registerUser",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputRegistrationUserDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/registration-confirmation": {
        "post": {
          "operationId": "AuthController_confirmUserEmail",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputConfirmationCodeDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthController_resendActivationCode",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputEmailDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/password-recovery": {
        "post": {
          "operationId": "AuthController_passwordRecovery",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputEmailPasswordRecoveryDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/new-password": {
        "post": {
          "operationId": "AuthController_setNewPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputNewPasswordDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/auth/me": {
        "get": {
          "operationId": "AuthController_me",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/blogs": {
        "get": {
          "operationId": "BlogsController_getAllBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/blogs/{id}": {
        "get": {
          "operationId": "BlogsController_getBlogById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/blogs/{id}/posts": {
        "get": {
          "operationId": "BlogsController_getPostsForBlogId",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/posts": {
        "get": {
          "operationId": "PostsController_getAllPosts",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/posts/{id}": {
        "get": {
          "operationId": "PostsController_getPostById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/posts/{postId}/comments": {
        "get": {
          "operationId": "PostsController_getCommentsByPostId",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "PostsController_createComment",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputCommentDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/posts/{postId}/like-status": {
        "put": {
          "operationId": "PostsController_updateLikeStatus",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputLikeStatusDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/comments/{id}": {
        "get": {
          "operationId": "CommentsController_getCommentById",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/comments/{commentId}": {
        "put": {
          "operationId": "CommentsController_updateComment",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputCommentDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "CommentsController_deleteComment",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/comments/{commentId}/like-status": {
        "put": {
          "operationId": "CommentsController_updateLikeStatus",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputLikeStatusDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/security/devices": {
        "get": {
          "operationId": "DevicesController_getAllSessions",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "DevicesController_deleteAllOtherSessions",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/security/devices/{deviceId}": {
        "delete": {
          "operationId": "DevicesController_deleteSession",
          "parameters": [
            {
              "name": "deviceId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/sa/blogs": {
        "get": {
          "operationId": "SuperAdminBlogsController_getAllBlogs",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/sa/blogs/{blogId}/bind-with-user/{userId}": {
        "put": {
          "operationId": "SuperAdminBlogsController_bindBlogToUser",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/sa/blogs/{id}/ban": {
        "put": {
          "operationId": "SuperAdminBlogsController_banBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputSABanBlogDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/sa/users": {
        "get": {
          "operationId": "SuperAdminUsersController_getAllUsers",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "SuperAdminUsersController_createUser",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputCreateUserDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/sa/users/{id}": {
        "delete": {
          "operationId": "SuperAdminUsersController_deleteUser",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/sa/users/{id}/ban": {
        "put": {
          "operationId": "SuperAdminUsersController_banUser",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputBanUserDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/blogger/blogs": {
        "get": {
          "operationId": "BloggerBlogsController_getAllBlogsForBlogger",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "BloggerBlogsController_createBlog",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputBlogCreateDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/blogger/blogs/{id}": {
        "put": {
          "operationId": "BloggerBlogsController_updateBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputUpdateBlogDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "BloggerBlogsController_deleteBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/blogger/blogs/{blogId}/posts": {
        "post": {
          "operationId": "BloggerBlogsController_createPostForBlog",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputCreatePostForBlogDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/blogger/blogs/{blogId}/posts/{id}": {
        "put": {
          "operationId": "BloggerBlogsController_updatePost",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputUpdatePostDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "BloggerBlogsController_deletePost",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/blogger/blogs/comments": {
        "get": {
          "operationId": "BloggerBlogsController_getAllCommentsForBloggerPosts",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/blogger/users/{id}/ban": {
        "put": {
          "operationId": "BloggerUsersController_banUser",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/InputBanUserForBlogDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/blogger/users/blog/{id}": {
        "get": {
          "operationId": "BloggerUsersController_getAllBannedUsersForBlog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      }
    },
    "info": {
      "title": "Blog Platform",
      "description": "API created with NestJS",
      "version": "2.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "blog-platform",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "schemas": {
        "InputLoginUserDto": {
          "type": "object",
          "properties": {}
        },
        "InputRegistrationUserDto": {
          "type": "object",
          "properties": {}
        },
        "InputConfirmationCodeDto": {
          "type": "object",
          "properties": {}
        },
        "InputEmailDto": {
          "type": "object",
          "properties": {}
        },
        "InputEmailPasswordRecoveryDto": {
          "type": "object",
          "properties": {}
        },
        "InputNewPasswordDto": {
          "type": "object",
          "properties": {}
        },
        "InputCommentDto": {
          "type": "object",
          "properties": {}
        },
        "InputLikeStatusDto": {
          "type": "object",
          "properties": {}
        },
        "InputSABanBlogDto": {
          "type": "object",
          "properties": {}
        },
        "InputCreateUserDto": {
          "type": "object",
          "properties": {}
        },
        "InputBanUserDto": {
          "type": "object",
          "properties": {}
        },
        "InputBlogCreateDto": {
          "type": "object",
          "properties": {}
        },
        "InputUpdateBlogDto": {
          "type": "object",
          "properties": {}
        },
        "InputCreatePostForBlogDto": {
          "type": "object",
          "properties": {}
        },
        "InputUpdatePostDto": {
          "type": "object",
          "properties": {}
        },
        "InputBanUserForBlogDto": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
