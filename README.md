# A bridge between Slack and IRC

## Inspiration
This project was inspired by [node-slack-irc](https://github.com/IgorAntun/node-slack-irc).

## Description
The bridge will listen to messages on the specified Slack channel and all the IRC channels in the configuration file
and relay them from one to the other.

### Setting up
Run `npm install`.

### Configuration

#### Slack
In `config.json`, edit the following values:
- `token`: the Slack token, from the Bot configuration page
- `channel`: the Slack channel id

#### IRC
In `config.json`, edit the following values:
- `server`: the IRC server to connect to
- `userName`: the name that will appear in IRC
- `realName`: the real name for the bridge
- `channels`: and array of channels the bridge will connect to
- `debug`: setting this to true will log messages to the console. Useful for debugging.
- `autoConnect`: whether the bridge should connect automatically
- `autoRejoin`: whether the bridge should join the channels automatically
- `secure`: `true` or `false`, depending on the connection type
- `port`: the port number

### Running
`node main.js`

## Commands
### General
- `!status` will print out the current status of the bridge

### Usable from IRC

### Usable from Slack
- `!names` will list the online users in the connected IRC channel
