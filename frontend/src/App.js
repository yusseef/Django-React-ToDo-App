import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      todoList:[],
      activeItems:{
        id:null,
        title:'',
        completed:false,
      },
      editing:false,
    }
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie = this.getCookie.bind(this)
    this.startEdit = this.startEdit.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
   };

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

   componentWillMount(){
     this.fetchTasks();

   }
   fetchTasks(){
     console.log('Fetching ...')
     fetch('http://127.0.0.1:8000/api/task-list/').then(response => response.json())
     .then(data => 
      this.setState({
        todoList:data
      }));

   }
   handleChange(e){
     var name = e.target.name
     var value = e.target.value
     console.log('Name', name)
     console.log('Value', value)
     
     this.setState({
       activeItems:{
         ...this.state.activeItems,
         title:value
       }
     })

   }

   handleSubmit(e){
     e.preventDefault()
     console.log('ITEM', this.state.activeItems)
     var csrftoken = this.getCookie('csrftoken')

     var url = 'http://127.0.0.1:8000/api/task-create/'
     if(this.state.editing == true){
      url = `http://127.0.0.1:8000/api/task-update/${ this.state.activeItems.id}/`
      this.setState({
        editing:false
      })

     }
     fetch(url,{
       method:'POST',
       headers:{
        'Content-type':'application/json',
        'X-CSRFToken': csrftoken,
       },
       body:JSON.stringify(this.state.activeItems)
     }).then((response) => {
       this.fetchTasks()
       this.setState({
        activeItems:{
          id:null,
          title:'',
          completed:false,
        }
       })
     }).catch(function(error){
       console.log('ERROR:', error)
     })
   }
   startEdit(task){
      this.setState({
        activeItems:task,
        editing:true,
      })

   }
   deleteItem(task){
    var csrftoken = this.getCookie('csrftoken')
    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
      method:'DELETE',
      headers:{
        'Content-Type':'application/json',
        'X-CSRFToken':csrftoken,
      },
    }).then((response) => {
      this.fetchTasks()
    })

   }
   

  render(){
    var tasks = this.state.todoList
    var self = this
    return(
      <div className="container">
        <div id="task-container">
        <div id="form-wrapper">
        <form onSubmit={this.handleSubmit} id="form">
                    <div className="flex-wrapper">
                        <div style={{flex: 6}}>
                            <input  onChange={this.handleChange} className="form-control" id="title" value={this.state.activeItems.title} type="text" name="title" placeholder="Add task.." />
                         </div>

                         <div style={{flex: 1}}>
                            <input id="submit" className="btn btn-warning" type="submit" name="Add" />
                          </div>
                      </div>
                </form>
        </div>
        <div id="list-wrapper">
            {tasks.map(function(task, index){
                return(
                  <div key={index} className="task-wrapper flex-wrapper">
                    <div style={{flex:7}}>
                    <span>{task.title}</span>
                    </div>
                    <div style={{flex:1}}>
                    <button className="btn btn-sm btn-outline-info" onClick={() => self.startEdit(task)}>Edit</button>
                    </div><div>
                      <button className="btn btn-sm btn-outline-dark delete" onClick={() => self.deleteItem(task)}>..</button>
                    </div>
                    
                    </div>


                  
                )
            })}

        </div>

        </div>

      </div>

    )
  }

}

export default App;
