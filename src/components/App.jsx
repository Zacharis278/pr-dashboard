import React, { Component } from 'react';
import axios from 'axios'
import moment from 'moment'
import '../assets/App.css'


function Review(props) {
    var icon;
    if (props.state === 'APPROVED')
        icon = 'fa-check'
    else if (props.state === 'CHANGES_REQUESTED')
        icon = 'fa-times'
    else
        icon = 'fa-commenting-o'

    return (
        <div className="review">
            <img className="review-avatar" src={props.author.avatarUrl} alt={props.author.login}></img>
            <i className={`fa ${icon} review-icon`}></i>
        </div>
    )
}

function PullRequest(props) {
    const pullRequest = props.value
    let status;
    var statusClass;
    try {
        status = pullRequest.commits.edges[0].node.commit.status.state;
    } catch (err) {
        status = null;
    }

    if (status === 'SUCCESS') {
        statusClass = 'status-success'
    } else if (status === 'FAILURE') {
        statusClass = 'status-failure'
    } else if (status === 'PENDING') {
        statusClass = 'status-pending'
    }
    else {
        statusClass = 'status-unknown'
    }

    return (
        <div className={`pr-container ${statusClass}`}>
            <img className="author-avatar" src={pullRequest.author.avatarUrl} alt={pullRequest.author.login}></img>
            <div className="date-info">
                <p><b>Updated</b></p>
                <p className="dateUpdated">{moment(pullRequest.updatedAt).fromNow()}</p>
            </div>
            <h2 className="title">{pullRequest.title}</h2>
            <div className="details">
                <div className="repo-name">{pullRequest.repository.name}</div>
                {pullRequest.reviews.edges.map((review) => {
                    return <Review author={review.node.author} state={review.node.state}></Review>
                })}
            </div>
        </div>
    )
}

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            error: null,
            pullRequests: [],
        }
    }

    componentDidMount() {
        this.fetchData();
        setInterval(() => this.fetchData(), 1000*60*2);
    }

    resolveReviews(pullRequest) {
        var reviews = {}
        pullRequest.reviews.edges.forEach(review => {
            const author = review.node.author.login;
            const date = moment(review.node.updatedAt);
            const existingReview = reviews[author]
            if (!existingReview || moment(existingReview.node.updatedAt).isBefore(date)) {
                reviews[author] = review;
            }
        })
        pullRequest.reviews.edges = Object.values(reviews);
    }

    fetchData() {
        axios.get('/query/').then((result) => {
            try {
                var pullRequests = result.data.data.search.edges;
                pullRequests.forEach(pr => {
                    this.resolveReviews(pr.node)
                });
                this.setState({
                    loaded: true,
                    error: null,
                    pullRequests: pullRequests,
                })
            } catch(err) {
                this.setState({
                    loaded: true,
                    error: err,
                });
            }
            
        }, (err) => {
            console.log(err);
            this.setState({
                loaded: true,
                error: err,
            });
        });
    }

    render() {
        const { loaded, error, pullRequests } = this.state;
       
        let status_bar = null;
        if (error) {
            status_bar = <div className="status-bar error">Error: {error.message}</div>
        } else if (!loaded) {
            status_bar = <div className="status-bar info">Loading...</div>
        }
        return (
            <div>
                {status_bar} 
                {pullRequests.map((pr,i) => {
                    return <PullRequest key={i} value={pr.node}></PullRequest>
                })}
            </div>
        )
    }
}

export default App