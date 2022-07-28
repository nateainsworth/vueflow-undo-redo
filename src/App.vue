<script setup lang="ts">
import { VueFlow, useVueFlow,Elements, FlowEvents, VueFlowStore } from '@braks/vue-flow';
import { computed, watch, nextTick } from 'vue';
import useStore from './store.js';
import Controls from './Controls.vue'
import reStore from './undoredo.js';


const store = useStore();

const { onConnect,  nodes, addNodes, setNodes, setEdges, addEdges, applyNodeChanges, applyEdgeChanges, onEdgesChange, onNodesChange,onNodeDragStop,onNodeDragStart ,onSelectionDragStart,  onSelectionDragStop, onEdgeChange } = useVueFlow();

onConnect((params) => addEdges([params]));


let previousE = [];
let previousStoreState = store.elements;
let history = [];
let historyPosition = 0;
let dragActive = false;
// top defines the top of the history, if the user uses undo a few times and then performs some changes the top will prevent the redo from jumping back until it has been overwritten with a new value. 
let top = 0;


const updateStore = () => {
  previousStoreState = store.elements;
}

const onUndo = async () => {
  //const reloadFlow = reStore.undoChange();
  //store.elements = reloadFlow;

  // get history position - 1 and loop the individual changes
  history[historyPosition-1].changes.forEach((element) => {
    console.log(element)
    console.log('Undo: ' + element.undo.type)
    if(element.undo.type == "remove"){
      element.undo.e.type = "remove";
      console.log("node to delete:")
      console.log(element.undo.e)

      applyNodeChanges([element.undo.e]);
      
    }
   
  });
  
  historyPosition--;
  await nextTick();
  previousStoreState = store.elements;
  
}
const onRedo = async () => {
  //const reloadFlow = reStore.undoChange();
  //store.elements = reloadFlow;

    history[historyPosition-1].changes.forEach((element) => {
    console.log(element)
    console.log('redo: ' + element.redo.type)
    if(element.redo.type == "add"){
      element.redo.e.type = "add";
      console.log("node to add:")
      console.log(element.redo.addData[0].item)
      addNodes([element.redo.addData[0].item]);
      //applyNodeChanges([element.redo.e]);
      
    }
   
  });
  
  historyPosition++;
  await nextTick();
  previousStoreState = store.elements;
  
}


onNodeDragStop((e) => {
  console.log('drag stop');
  console.log(e);
  dragActive = false;
});

onNodeDragStart ((e) => {
  console.log('drag start');
  console.log(e);
  dragActive = true;
});

onSelectionDragStart((e) => {
  dragActive = true;
});

onSelectionDragStop((e) => {
  dragActive = false;
});

let addData = '';
onNodesChange((e) => {

  if(!dragActive ){
    // for some reason node change is triggered twise not once so we have to check against the first to avoid duplicates.

   // getting the node as an object to compare against without other factors from a proxy effecting the comparison
   // due to addnode returning two dimension nodechanges which match and nodechanged seems to trigger twice each time a change happens.
    let eAsString = JSON.stringify(e);
    //if(eAsString != previousE){
      previousE = eAsString;
    
      let changes = [];

      console.log(e);

      // ignores add as add also sends a dimentions event and since it's not currently within the vueflow the result check for exisiting ID will return undefined.
      if(e[0].type != "add"){
    
        e.forEach((element) => {
          console.log('With ID: ', element.id);
          let undoType = '';
          let redoType = '';

          // checks if element existed in the previous flow version
          const result = previousStoreState.find(({ id }) => id === element.id);
          
          let resultNode = '';

          // if no result found then we know that it's a new node
          if(result === undefined){
            undoType = 'remove';
            redoType = 'add';
            resultNode = element;
            //console.log('add node called: ' + element.id);
          }else{
            undoType =  element.type;
            redoType =  element.type;
            // change result from proxy to  object to give previous node settings
            resultNode = JSON.parse(JSON.stringify(result));
            //console.log(resultNode);
            console.log('update node called: ' + element.id);
          }

          // creates the redo and undo options for each element
          changes.push({  
            undo: {
              type: undoType,
              elementType: "node",
              e: resultNode,
              addData: addData,
            },
            redo: {
              type: redoType,
              elementType: "node",
              e: element,
              addData: addData,
            },
          });
          addData = null;
          console.log(changes[0].undo);
        })
        history.push({
          changes:changes
        })

        // saves the state before the next change happens.
        previousStoreState = store.elements;

        //increments the history position
        historyPosition++;
        console.log("History Position: " + historyPosition);
  
      }else{
        addData =  JSON.parse(JSON.stringify(e));
      }

    }
  //}

});

onEdgesChange((e) => {

});

// undo save the original value
// redo save the new value

</script>

<template>
  <VueFlow 
  v-model="store.elements" 
  :fit-view-on-init="true"

  >
    <div style="position: absolute; right: 10px; top: 10px; z-index: 4">
      <button @click="store.log">log store state</button>
      <button @click="onUndo">Undo</button>
      <button @click="onRedo">Redo</button>
      <button @click="updateStore">Update Store</button>
    </div>
    <Controls />
  </VueFlow>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
