<script setup lang="ts">
import { VueFlow, useVueFlow,Elements, FlowEvents, VueFlowStore } from '@braks/vue-flow';
import { computed, watch, nextTick } from 'vue';
import useStore from './store.js';
import Controls from './Controls.vue'
import reStore from './undoredo.js';




const store = useStore();

// old watch version

//const reStore2 = reStore();
/*
let prevlength = 0;
watch(() => store.elements.length, 
  (currentValue) => {
    if(prevlength != currentValue){
      prevlength = currentValue;
      console.log(currentValue);
      reStore.logChange(JSON.stringify(store.elements));
      //Controls.onSave();
    }
  },
  {deep: true}
);
*/

const { onConnect, addEdges, applyNodeChanges, applyEdgeChanges, onEdgesChange, onNodesChange,onNodeDragStop,onNodeDragStart ,onSelectionDragStart,  onSelectionDragStop, onEdgeChange } = useVueFlow();





onConnect((params) => addEdges([params]));




let previousE = [];
let previousStoreState = store.elements;
let history = [];
let refinedHistory = [];
let historyPosition = 0;
let dragActive = false;
// top defines the top of the history, if the user uses undo a few times and then performs some changes the top will prevent the redo from jumping back until it has been overwritten with a new value. 
let top = 0;


const updateStore = () => {
  previousStoreState = store.elements;
}

const onUndo = () => {
  //const reloadFlow = reStore.undoChange();
  //store.elements = reloadFlow;

  // get history position - 1 and loop the individual changes
  refinedHistory[historyPosition-1].changes.forEach((element) => {
    console.log(element)
    console.log('Undo: ' + element.undo.type)
    if(element.undo.type == "Delete"){
      element.undo.e.type = "remove";
      console.log("node to delete:")
      console.log(element.undo.e)

      //applyNodeChanges("remove", element.undo.e);
      applyNodeChanges([element.undo.e]);
      
    }
   
  });
  
  historyPosition--;
  
}
const onRedo = () => {
  //const reloadFlow = reStore.undoChange();
  //store.elements = reloadFlow;
  
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


onNodesChange((e) => {
   //const removalChanges = changes.filter(change => change.type === 'remove');

   // do some logic

   
//})
//const onNodesChange = async (e: FlowEvents['nodesChange']) => {
  if(!dragActive ){
    // for some reason node change is triggered twise not once so we have to check against the first to avoid duplicates.

   // getting the node as an object to compare against without other factors from a proxy effecting the comparison
   // due to addnode returning two dimension nodechanges which match and nodechanged seems to trigger twice each time a change happens.
    let eAsString = JSON.stringify(e);
    if(eAsString != previousE){
      previousE = eAsString;

      console.log('Node Changed: ', e)
      // add to history and increment history position
      history.push(e);
    
      let changes = [];

      // ignores add as add also sends a dimentions event and since it's not currently within the vueflow the result check for exisiting ID will return undefined.
      if(e[0].type != "add"){
    
        console.log("before each: ")
        console.log(e);
        e.forEach((element) => {
          console.log("after each: ")
          console.log(element);
          console.log('With ID: ', element.id);
          let undoType = '';
          let redoType = '';

          // checks if element existed in the previous flow version
          const result = previousStoreState.find(({ id }) => id === element.id);
          
          let resultNode = '';

          // if no result found then we know that it's a new node
          if(result === undefined){
            undoType = 'Delete';
            redoType = 'Add';
            resultNode = element;
          }else{
            undoType =  element.type;
            redoType =  element.type;
            // change result from proxy to  object to give previous node settings
            resultNode = JSON.parse(JSON.stringify(result));
            console.log(resultNode);
          }

          // creates the redo and undo options for each element
          changes.push({  
            undo: {
              type: undoType,
              elementType: "node",
              e: resultNode,
            },
            redo: {
              type: redoType,
              elementType: "node",
              e: element,
            },
          });


        })
        refinedHistory.push({
          changes:changes
        })

        // saves the state before the next change happens.
        previousStoreState = store.elements;

        //increments the history position
        historyPosition++;
        console.log("History Position: " + historyPosition);
        console.log('history: ' + history);
      }
      


      

    }
  }
  //applyNodeChanges(e);
});

onEdgesChange((e) => {
/*  if(!dragActive ){
    // for some reason node change is triggered twise not once so we have to check against the first to avoid duplicates.
    //if(e != previousE){
      previousE = e;
      console.log('Node Changed: ', e)
      // add to history and increment history position
      history.push(e);
      historyPosition++;
      console.log('history: ' + history);

      e.forEach((element) => {
        console.log('With ID: ', element.id);
        
        //previousStoreState.getNode(element.id)
        
      })

      //previousStoreState.getNode(element.id)
    //}
  }
  */
});

// undo save the original value
// redo save the new value

</script>

<!--   @node-drag-stop="onNodeDragStop"
  @node-drag-start="onNodeDragStart"
  @edges-change="onEdgeChange"
  @selection-drag-start="onSelectionDragStart"
  @selection-drag-stop="onSelectionDragStop"
  -->
<template>
  <VueFlow 
  v-model="store.elements" 
  :fit-view-on-init="true"

  >
    <div style="position: absolute; right: 10px; top: 10px; z-index: 4">
      <button @click="store.log">log store state</button>
      <button @click="onUndo">Undo</button>
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
