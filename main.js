// Requires
var Slack = require('slack-client');
var IRC = require('irc');
var _ = require('lodash')

var pack = require("./package.json");
var config = require("./config.json");

// Connection
var irc = new IRC.Client(config.irc.server, config.irc.userName, config.irc)
var slack = new Slack(config.slack.token, false, false);
var channel;

// Variables
var status = {
    name: config.irc.userName,
    messages: 0,
    connected: false
};

// IRC Listeners
irc.addListener('message', function(from, to, message) {
    channel.postMessage({
        channel: config.slack.channel,
        text: message,
        username: from,
        icon_url: 'http://api.adorable.io/avatars/48/' + from});
    status.messages++;
});

irc.addListener('error', function(message) {
    console.log('Error: ', message);
});

irc.addListener('join#find', function(nick, message) {
    channel.postMessage({
        channel: config.slack.channel,
        text: 'Joins *#find:* ' + nick,
        username: 'Status',
        icon_url: 'http://api.adorable.io/avatars/48/info'});
});

irc.addListener('part#find', function(nick, message) {
    channel.postMessage({
        channel: config.slack.channel,
        text: 'Parts *#find*: ' + nick,
        username: 'Status',
        icon_url: 'http://api.adorable.io/avatars/48/info'});
});

irc.addListener('registered', function(message) {
    status.connected = true;
});

irc.addListener('names#find', function(nicks) {
    text = "Here's a list of people online on *#find*. One of them might be me, I can't tell...\n";
    names = _.chain(nicks)
        .keys()
        .map(function(name) {
            return '*' + name + '*'
        })
        .join(', ')
        .value();

    channel.postMessage({
        channel: config.slack.channel,
        text: text + names,
        username: 'status',
        icon_url: 'http://api.adorable.io/avatars/48/info'
    })
});

// Slack Callbacks
slack.on('open', function() {
    channel = slack.getChannelGroupOrDMByID(config.slack.channel);
});

slack.on('message', function(message) {
    if (!status.connected) {
        return;
    }

    if (typeof message.text == 'undefined') return;

    if (message.channel === config.slack.channel) {
        if (_.startsWith(message.text, '!')) {
            command = message.text.substr(1);
            switch (command) {
            case 'status':
                channel.postMessage({
                    channel: config.slack.channel,
                    text: '<@' + message.user + '> *- Version:* ' + pack.version + ' *| Uptime:* ' + process.uptime() + 's *| Messages sent/received:* ' + status.messages,
                    username: 'Status',
                    icon_url: 'http://api.adorable.io/avatars/48/info'
                });
                break;
            case 'names':
                irc.send('NAMES');
                break;
            default:
                console.log('Invalid command:', command);
            }
        } else {
            var user = slack.getUserByID(message.user);
            if (user && !user.isBot) {
                status.messages++;
                irc.say(config.irc.channels, user.name + ' > ' + message.text);
            }
        }
    }
});

slack.login();

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
    console.log('Stack trace: ' + err.stack);
});
