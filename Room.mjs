
import SocketIO from 'socket.io';

export default class Room{
    constructor(name,type,channel,io){
        this.name = name
        this.type = type
        this.connections = new Map();
        this.alive = true;
        this.connectTriggers = []
        this.channel = channel;

        this.nsp = io.of('/' + this.channel);
    }
    setupStartHandlers(){
        this.nsp.on('connection', (socket)=>{
            socket.on('get_room_details', (channel)=>{
                this.getDetails();
                socket.emit('room_details', this.getDetails())
            })
            socket.on('join', (data)=>{
                this.addSocket(socket,data.constrains, data.id, data.properties,data.media_state)
            })
        });
    }
    getConnections(){
        return this.connections
    }
    triggerConnect(socket){
        for(let trigger of this.connectTriggers){
            trigger(socket)
        }
    }
    onConnect(callback){
        this.connectTriggers.push(callback)
    }
    obHandler(connection){
        connection.socket.on('topics', (topics)=>{
            this.topics = topics
        })
    }
    getPeers(){
        return this.connections;
    }
    regHandler(socket,handler, callback){
        socket.on(handler, callback)
    }
    addConnection(socket_id,connection){
        this.connections.set(socket_id, connection)
        this.attachHandlers(connection)
    }
    attachHandlers(connection){
        this.handshakeHandlers(connection)
        this.muteUnmuteHandler(connection)
        this.partHandler(connection)
        this.disconnectHandler(connection)
    }
    disconnectHandler(connection){
        connection.on('disconnect', () =>{
            this.removePeer(connection.socket.id)
            if(connection.disconnectHandler)
                connection.disconnectHandler(connection.socket.id)
        });
    }
    removePeer(id){
        this.kickUser(id)  
        this.connections.delete(id)
    }
    kickUser(id){
        this.connections.forEach((connection, key)=>{
            connection.emit('removePeer', {'socket_id': id})
        })
    }
    partHandler(connection){
        connection.on('part', (details)=>{
            this.removePeer(connection.socket.id)
            if(connection.disconnectHandler)
                connection.disconnectHandler(id)
        })
    }
    propertiesHandler(connection){
        connection.on('new_properties', (options)=>{
            connection.properties = options.properties
        })
    }
    muteUnmuteHandler(connection){
        connection.on('new_constrains', (options)=>{ 
            connection.constrains = options
            this.connections.forEach((con, key)=>{
                if(key != connection.socket.id){
                    con.emit('relayNewConstrains', {'socket_id': connection.socket.id, 'constrains': options})
                }
            })
        })
    }
    handshakeHandlers(connection,relaySessionDescription){
        connection.on('relayICECandidate', (config) => {
            
            this.connections.get(config.socket_id).emit('iceCandidate', {'socket_id': connection.socket.id, 'ice_candidate':  config.ice_candidate} 
        )})
        connection.on('relaySessionDescription', (config) => {
            connection.properties = config.properties
            this.connections.get(config.socket_id).emit('sessionDescription', {'socket_id': connection.socket.id, 'session_description': config.session_description, 'properties': connection.properties})
        });
    }
    getPeer(id){
        if(!this.connections.get(id))
            console.log('There is no such a peer!');
        return this.connections.get(id);
    }

    closeRoom(){
        for(let connection in this.connections){
            this.kickUser(connection);
        }
        this.alive = false;
    }
}
