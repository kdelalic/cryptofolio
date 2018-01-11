import React, { Component } from 'react'
import '../css/crypto.css';
import Progress from './progress.js'
import Modal from 'material-ui/Modal'
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add'
import AddCoin from './addcoin.js';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import {checkPos, toMonth} from './helpers.js'
import socketIOClient from "socket.io-client";


class Crypto extends Component {
	constructor(props) {
	    super(props);

	    this.state = {
		    open: false,
		    convertCurrency: 'USD',
		    subscriptions: {},
		    endpoint: "wss://streamer.cryptocompare.com",
		};
  	}

  	componentWillUpdate(nextProps, nextState) {
  		if(nextState.subscriptions !== this.state.subscriptions){
  			const { endpoint } = this.state;
	    	const socket = socketIOClient(endpoint);
	    	socket.emit('SubAdd', { subs: nextState.subscriptions } ); 
	    	socket.on("m", data => {
	    		console.log(data)
	    		Object.keys(nextState.subscriptions).map((key) => {
	    			const response = data.split("~")
	    			if(!isNaN(response[5])){ 
		    			this.setState({
		    				...this.state,
		    				coins: {
		    					...this.state.coins,
		    					[key]: {
		    						...this.state.coins[key],
		    						currentPrice: parseFloat(response[5]),
		    						profit: parseFloat(((parseFloat(response[5]) - this.state.coins[key].price) * this.state.coins[key].amount).toFixed(2))
		    					}
		    				}
		    			}, () => {
		    			})
	    			}
		 		})
		    });
  		}
  	}

  	componentDidMount() {
	    // const { endpoint } = this.state;
	    // const socket = socketIOClient(endpoint);
	    // socket.emit('SubAdd', { subs: this.state.subscriptions } ); 
	    // socket.on("m", data => {
	      
	    // });
    }

	handleOpen = () => {
	  this.setState({ ...this.state, open: true });
	};

	handleClose = () => {
	  this.setState({ ...this.state, open: false });
	};

	coinData = (dataFromChild, key) => {
		const addSub = "5~CCCAGG~" + dataFromChild.value.substring(dataFromChild.value.indexOf("(")+1,dataFromChild.value.indexOf(")")) + "~" + this.state.convertCurrency
        this.setState({
        	...this.state,
        	subscriptions: {
        		...this.state.subscriptions, 
        		[key]: addSub
        	},
        	coins: {
        		...this.state.coins,
        		[key]: dataFromChild
        	},
        }, () => {
	        this.handleClose();
        })
    };

	render() {
		const { coins } = this.state;
		return (
			<div className="crypto">
				<h1>UNDER DEVELOPMENT</h1>
				<Progress coins={this.state.coins}/>
				<div className="header">
					<Paper>
				    	<Table>
					        <TableHead children={TableRow}>
						        <TableRow>
						            <TableCell>Coin</TableCell>
						            <TableCell numeric>Current Price</TableCell>
						            <TableCell numeric>Total Value</TableCell>
						            <TableCell numeric>Profit/Loss</TableCell>
						            <TableCell numeric>Change</TableCell>
						        </TableRow>
					        </TableHead>
					        <TableBody children={TableRow}>
						        {coins && Object.keys(coins).map((key, index) => {
									const coin = coins[key]
						            return (
						                <TableRow key={`coin-${index}`}>
							                <TableCell className="cell">
							                	<div className="coin">{coin.value}</div>
							                	<div className="date">{"(" + toMonth(coin.date.substring(5, 7)) + " " + coin.date.substring(8, 10) + ", " + coin.date.substring(0, 4) + ")"}</div>
							                </TableCell>
							                <TableCell numeric>{coin.currency.toUpperCase() + " " + coin.currentPrice}</TableCell>
							                <TableCell numeric>{coin.currency.toUpperCase() + " " + (coin.currentPrice * coin.amount).toFixed(2)}</TableCell>
							                <TableCell numeric className={checkPos(coin.profit)}>{coin.currency.toUpperCase() + " " + coin.profit}</TableCell>
							                <TableCell numeric className={checkPos(((parseFloat((coin.currentPrice - coin.price) * coin.amount) / (coin.amount * coin.price)) * 100).toFixed(2))}>{((parseFloat((coin.currentPrice - coin.price) * coin.amount) / (coin.amount * coin.price)) * 100).toFixed(2) + "%"}</TableCell>
						                </TableRow>
						            );
						        })}
					        </TableBody>
				      	</Table>
				    </Paper>
					<Button fab mini color="primary" aria-label="add" onClick={this.handleOpen} className="add">
				        <AddIcon />
				    </Button>
			    </div>
				<Modal
		          aria-labelledby="Add Coin"
		          aria-describedby="Add a Coin"
		          open={this.state.open}
		          onClose={this.handleClose}
		        >
		        	<AddCoin coinData={this.coinData}/>
		        </Modal>
			</div>
		);
	}
}

export default Crypto;