import React, { Component} from 'react';

import axios from 'axios';

class Fib extends Component{
    state ={
        seenIndexs: [],
        values: {},
        index: ''
    };

    componentDidMount(){
        this.fetchValues();
        this.fetchIndex();
    };

    async fetchValues(){
        try {
            const values = await axios.get('/api/values/current');
            this.setState({ values: values.data });
        } catch (error) {
            console.log(error)
        }
    };
    async fetchIndex(){
        try {            
            const seenIndex = await axios.get('/api/values/all');
            this.setState({
                seenIndexs: seenIndex.data,
            })
        } catch (error) {
            console.log(error)
        }
    };
    handleSubmit = async (event) =>{
        event.preventDefault();
        try {
            await axios.post('/api/values',{
                index: this.state.index,
            });
            this.setState({ index: '' })
        } catch (error) {
            console.log(error)
        }
    }
    renderSeenIndexs(){
        return this.state.seenIndexs.map(({ number }) => number).join(', ')
    };

    renderValues(){
        const entries =[];

        for (let key in this.state.values){
            entries.push(
                <div key={key}>
                    For index { key } I calculated { this.state.values[key] }.
                </div>
            )
        }
    };

    render(){
        return(
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input
                        value={this.state.index }
                        onChange={event => this.setState({
                            index: event.target.value
                        })} 
                    />
                    <button>Submit</button>
                </form>

                <h3>Index I have seen:</h3>
                {this.renderSeenIndexs()}

                <h3>Calculated Values</h3>
                {this.renderValues()}
            </div>
        )
    }
};
export default Fib;