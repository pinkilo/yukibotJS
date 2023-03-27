#!/usr/bin/env node

'use strict';

var googleapis = require('googleapis');
var util = require('util');
var fs = require('fs');
var console$1 = require('console');
var express = require('express');
var path = require('path');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var console__namespace = /*#__PURE__*/_interopNamespaceDefault(console$1);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

require("dotenv").config();
var ENV = {
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE: {
        G_PROJECT_ID: process.env.G_PROJECT_ID,
        G_CLIENT_ID: process.env.G_CLIENT_ID,
        G_AUTH_URI: process.env.G_AUTH_URI,
        G_TOKEN_URI: process.env.G_TOKEN_URI,
        G_AUTH_PROVIDER_CERT_URL: process.env.G_AUTH_PROVIDER_CERT_URL,
        G_CLIENT_SECRET: process.env.G_CLIENT_SECRET,
        G_REDIRECT_URI: process.env.G_REDIRECT_URI,
    },
};

var file = {
    write: util.promisify(fs.writeFile),
    read: util.promisify(fs.readFile),
    exists: fs.existsSync,
};

var yt = googleapis.google.youtube("v3");
var liveChatId;
var nextPage;
var pollingInterval;
var ratelimit = 5000;
var chatMessages = [];
var tokenPath = "./.private/tokens.json";
var onAuthUpdate = [];
var scope = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.force-ssl",
];
var auth = new googleapis.google.auth.OAuth2(ENV.GOOGLE.G_CLIENT_ID, ENV.GOOGLE.G_CLIENT_SECRET, ENV.GOOGLE.G_REDIRECT_URI);
var getAuthUrl = function () {
    return auth.generateAuthUrl({ access_type: "offline", scope: scope });
};
/** Sets auth credentials and writes tokens to file */
var authorize = function (tokens) { return auth.setCredentials(tokens); };
/** Get auth tokens with callback code */
var getTokens = function (code) { return __awaiter(void 0, void 0, void 0, function () {
    var creds;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, auth.getToken(code)];
            case 1:
                creds = _a.sent();
                return [2 /*return*/, creds.tokens];
        }
    });
}); };
var loadTokens = function () { return __awaiter(void 0, void 0, void 0, function () {
    var raw, tokens_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!file.exists(tokenPath)) return [3 /*break*/, 2];
                return [4 /*yield*/, file.read(tokenPath)];
            case 1:
                raw = _a.sent();
                tokens_1 = JSON.parse(raw.toString());
                if (tokens_1) {
                    console__namespace.log("loading saved tokens");
                    auth.setCredentials(tokens_1);
                    onAuthUpdate.forEach(function (f) { return f(tokens_1); });
                }
                else {
                    console__namespace.log("No saved tokens");
                }
                return [3 /*break*/, 3];
            case 2:
                console__namespace.log("No saved tokens");
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
var getChatMessages = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, newMessages;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, yt.liveChatMessages.list({
                    auth: auth,
                    part: ["snippet", "authorDetails"],
                    liveChatId: liveChatId,
                    pageToken: nextPage,
                })];
            case 1:
                response = _a.sent();
                newMessages = response.data.items;
                chatMessages.push.apply(chatMessages, newMessages);
                nextPage = response.data.nextPageToken;
                console__namespace.log(chatMessages);
                return [2 /*return*/];
        }
    });
}); };
var findChat = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, latest;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, yt.liveBroadcasts.list({
                    auth: auth,
                    part: ["snippet"],
                    broadcastStatus: "active",
                })];
            case 1:
                response = _a.sent();
                latest = response.data.items[0];
                liveChatId = latest.snippet.liveChatId;
                console__namespace.log(liveChatId);
                return [2 /*return*/];
        }
    });
}); };
var trackChat = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console__namespace.log("Attempting to track chat");
                return [4 /*yield*/, findChat()];
            case 1:
                _a.sent();
                pollingInterval = setInterval(getChatMessages, ratelimit);
                return [2 /*return*/];
        }
    });
}); };
var untrackChat = function () {
    clearInterval(pollingInterval);
};
var onTokenUpdate = function (callback) { return onAuthUpdate.push(callback); };
auth.on("tokens", function (tokens) {
    console__namespace.log("Tokens Updated");
    onAuthUpdate.forEach(function (f) { return f(tokens); });
    file.write("./.private/tokens.json", JSON.stringify(tokens));
});
var yt$1 = {
    getAuthUrl: getAuthUrl,
    getTokens: getTokens,
    findChat: findChat,
    trackChat: trackChat,
    loadTokens: loadTokens,
    authorize: authorize,
    untrackChat: untrackChat,
    onTokenUpdate: onTokenUpdate,
};

var server = (function () {
    var svr = express();
    svr.get("/", function (_, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            res.sendFile(path.join(__dirname, "assets/index.html"));
            return [2 /*return*/];
        });
    }); });
    svr.get("/auth", function (_, res) {
        res.redirect(yt$1.getAuthUrl());
    });
    svr.get("/callback", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var code, creds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    code = req.query.code;
                    return [4 /*yield*/, yt$1.getTokens(code)];
                case 1:
                    creds = _a.sent();
                    yt$1.authorize(creds);
                    res.redirect("/");
                    return [2 /*return*/];
            }
        });
    }); });
    return svr;
});

function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    yt$1.onTokenUpdate(function () {
                        yt$1.trackChat();
                    });
                    return [4 /*yield*/, yt$1.loadTokens()];
                case 1:
                    _a.sent();
                    server().listen(3000, function () { return console.log("http://localhost:3000"); });
                    return [2 /*return*/];
            }
        });
    });
}
main();