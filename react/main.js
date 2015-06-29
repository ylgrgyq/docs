var TmplSelect = React.createClass({
  handleChange: function(e) {
    e.preventDefault();
    var tmpl = React.findDOMNode(this.refs.tmplSelect).value
    if (tmpl != '') {
      this.props.onTmplSelect(tmpl);
    }
  },
  render: function() {
    var options = this.props.data.map(function(tmpl) {
      return (
        <option>{tmpl}</option>
      );
    })
    return (
      <select ref='tmplSelect' onChange={this.handleChange}>
        <option value=''>选择模板</option>
        {options}
      </select>
    );
  }
});

var ImplContent = React.createClass({
  handleSubmit: function(e) {
    event.preventDefault();
    this.props.onSaveContent(this.state.content);
  },
  handleChange: function(e) {
    this.setState({content: event.target.value});
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      content: nextProps.data
    });
  },
  render: function() {
    if (this.state) {
      return (
        <div>
          <form onSubmit={this.handleSubmit}>
            <textarea rows="8" cols="160" value={this.state.content} onChange={this.handleChange}></textarea>
            <input type="submit" value="保存" onClick={this.handleSubmit} />
          </form>
        </div>
      );
    } else {
      return (
        <div>
        </div>
      );
    }
  }
});

var TmplImpl = React.createClass({
  handleClick: function(e) {
    e.preventDefault();
    var impl = e.target.value;
    $.ajax({
      url: 'tmpls/' + this.props.data.currentTmpl + '/impls/' + impl + '/blocks/' + this.props.data.block,
      dataType: 'json',
      success: function(data) {
        if (data.blockContent === undefined) {
          data.blockContent = ''
        }
        this.setState({
          tmpl: this.props.data.currentTmpl,
          impl: impl,
          block: this.props.data.block,
          content: data.blockContent
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleSaveContent: function(content) {
    this.setState({content: content});
    $.ajax({
      url: 'tmpls/' + this.state.tmpl + '/impls/' + this.state.impl + '/blocks/' + this.state.block,
      method: 'POST',
      dataType: 'json',
      data: {content: content},
      success: function(data) {
        this.setState({
          content: content
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {
      content: null
    };
  },
  render: function() {
    var buttons = this.props.data.impls.map(function(impl) {
      return (
        <input type='button' value={impl} onClick={this.handleClick} />
      )
    }.bind(this));
    return (
      <div>
        {buttons}
        <ImplContent data={this.state.content} onSaveContent={this.handleSaveContent} />
      </div>
    );
  }
});

var Paragraph = React.createClass({
  render: function() {
    var content = this.props.data.paragraph;
    var re = /{% block (.*?) %}(.*?){% endblock %}/
    match = content.match(re);
    if (match) {
      var data = {currentTmpl: this.props.data.currentTmpl, impls: this.props.data.impls, block: match[1]}
      return (
        <div>
          {content}
          <TmplImpl data={data} />
        </div>
      )
    } else {
      return (
        <div>{content}</div>
      );
    }
  }
});

var TmplContent = React.createClass({
  render: function() {
    var ps = this.props.data.tmplContent.paragraphs.map(function(paragraph) {
      var data = {paragraph: paragraph, currentTmpl: this.props.data.currentTmpl, impls: this.props.data.tmplImpls};
      return (
        <Paragraph data={data} />
      );
    }.bind(this));
    return (
      <div>
        {ps}
      </div>
    );
  }
});

var TmplBox = React.createClass({
  handleTmplSelect: function(tmpl) {
    $.ajax({
      url: 'tmpls/' + tmpl + '/impls',
      dataType: 'json',
      success: function(data) {
        this.setState({currentTmpl: tmpl, tmplImpls: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
    
    $.ajax({
      url: 'tmpls/' + tmpl,
      dataType: 'json',
      success: function(data) {
        this.setState({tmplContent: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
    
  },
  getInitialState: function() {
    return {
      tmpls: [],
      currentTmpl: '',
      tmplContent: {
        paragraphs: []
      }
    };
  },
  componentDidMount: function() {
    $.ajax({
      url: 'tmpls',
      dataType: 'json',
      success: function(data) {
        this.setState({tmpls: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div className='tmplBox'>
        <TmplSelect data={this.state.tmpls} onTmplSelect={this.handleTmplSelect} />
        <TmplContent data={this.state} />
      </div>
    );
  }
});

React.render(
  <TmplBox />,
  document.getElementById('content')
);

