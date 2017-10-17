import React from "react";

class FilterInput extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

    this.state = {
      value: ''
    };
  }

  handleChange(event) {
    // Update the input field
    this.setState({value: event.target.value});

    // Inform stream of change to filter
    this.props.updateStreamFilter(event.target.value);
  }

  render() {
    return (
      <div className="filter">
        <input 
          value={this.state.value} 
          onChange={this.handleChange} 
          type="text" 
          placeholder="Search press releases by title..."/>
      </div>
    );
  }
}

export default FilterInput;