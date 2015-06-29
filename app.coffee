fs = require 'fs'
express = require('express')
path = require('path')
cookieParser = require('cookie-parser')
bodyParser = require('body-parser')
_ = require 'underscore'

app = express()
app.use express.static('server_public')

app.use bodyParser.json()
app.use bodyParser.urlencoded(extended: false)
app.use cookieParser()

app.get '/tmpls', (req, res) ->
  stats = fs.readdirSync(path.join(__dirname, 'views'))
  stats = _.filter stats, (stat) ->
    return stat.search(/\.tmpl$/) > 0
  stats = _.map stats, (stat) ->
    return stat.replace '.tmpl', ''
  res.send stats

app.get '/tmpls/:tmpl', (req, res) ->
  tmpl = req.params.tmpl
  content = fs.readFileSync(path.join(__dirname, 'views', "#{tmpl}.tmpl"), {encoding: 'utf-8'})
  paragraphs = content.split '\n\n' # 两个连续回车认为是一个段落
  res.send
    paragraphs: paragraphs

app.get '/tmpls/:tmpl/impls', (req, res) ->
  tmpl = req.params.tmpl
  stats = fs.readdirSync(path.join(__dirname, 'views'))
  re = new RegExp("^#{tmpl}-(.*)\.md$")
  stats = _.map stats, (stat) ->
    result = stat.match re
    if result?
      return result[1]
  stats = _.filter stats, (stat) ->
    return stat != undefined
  res.send stats

app.get '/tmpls/:tmpl/impls/:impl/blocks/:block', (req, res) ->
  blocks = getBlocks req.params.tmpl, req.params.impl
  block = _.find blocks, (block) ->
    return block.block is req.params.block
  unless block
    block = {block: req.params.block, content: ''}
  res.send
    blockContent: block.content

app.post '/tmpls/:tmpl/impls/:impl/blocks/:block', (req, res) ->
  tmpl = req.params.tmpl
  impl = req.params.impl
  blocks = getBlocks tmpl, impl
  isExist = false
  _.each blocks, (block) ->
    if block.block is req.params.block
      block.content = req.body.content
      isExist = true
  unless isExist
    blocks.push {block: req.params.block, content: req.body.content}
  saveBlocks tmpl, impl, blocks
  res.send {}

getBlocks = (tmpl, impl) ->
  blockRe = new RegExp("{%\\s+block\\s+(.*?)\\s?%}", 'm')
  content = fs.readFileSync(path.join(__dirname, 'views', "#{tmpl}-#{impl}.md"), {encoding: 'utf-8'})
  blocks = _.map content.split(/{%\s?endblock\s?%}/), (block) ->
    match = block.match blockRe
    if match?
      return {block: match[1], content: block.substring(match.index + match[0].length)}
  return _.filter blocks, (block) ->
    return block?

saveBlocks = (tmpl, impl, blocks) ->
  content = _.reduce blocks, (result, block) ->
    result += "\n{% block #{block.block} %}#{block.content}{% endblock %}\n"
  , "{% extends \"./#{tmpl}.tmpl\" %}\n"
  fs.writeFileSync(path.join(__dirname, 'views', "#{tmpl}-#{impl}.md"), content, {encoding: 'utf-8'})

# 如果任何路由都没匹配到，则认为 404
# 生成一个异常让后面的 err handler 捕获
app.use (req, res, next) ->
  err = new Error('Not Found')
  err.status = 404
  next err
  return

# error handlers
# 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
if app.get('env') == 'development'
  app.use (err, req, res, next) ->
    res.status err.status or 500
    res.send
      message: err.message
      error: err.stack || err
    return
# 如果是非开发环境，则页面只输出简单的错误信息
app.use (err, req, res, next) ->
  res.status err.status or 500
  res.send
    message: err.message
  return

module.exports = app
