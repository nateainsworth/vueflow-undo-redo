<script setup lang="ts">
import { VueFlow, useVueFlow,Elements, FlowEvents, VueFlowStore } from '@braks/vue-flow';
import { computed, watch } from 'vue';
import useStore from './store.js';
import Controls from './Controls.vue'
import reStore from './undoredo.js';


const store = useStore();

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
const { onConnect, addEdges, applyNodeChanges, applyEdgeChanges } = useVueFlow();

onConnect((params) => addEdges([params]));




let previousE = [];
let previousStoreState = store.elements;
let history = [];
let refinedHistory = [];
let historyPosition = 0;
let dragActive = false;


const updateStore = () => {
  previousStoreState = store.elements;
}
const onUndo = () => {
  //const reloadFlow = reStore.undoChange();
  //store.elements = reloadFlow;
  console.log("History Position: " + historyPosition);
  history[historyPosition-1].forEach((element) => {
    
    console.log('With ID: ', element.id);
    const result = previousStoreState.find(({ id }) => id === element.id);
    console.log(result);  
      
  })
  
}
const onRedo = () => {
  //const reloadFlow = reStore.undoChange();
  //store.elements = reloadFlow;
  
}

const onNodeDragStop = (e: FlowEvents['nodeDragStop']) => {
  console.log('drag stop');
  console.log(e);
  dragActive = false;
}

const onNodeDragStart = (e: FlowEvents['nodeDragStart']) => {
  console.log('drag start');
  console.log(e);
  dragActive = true;
}

const onNodesChange = (e: FlowEvents['nodesChange']) => {
  if(!dragActive ){
    // for some reason node change is triggered twise not once so we have to check against the first to avoid duplicates.
    if(e != previousE){
      previousE = e;
      console.log('Node Changed: ', e)
      // add to history and increment history position
      history.push(e);
      
      historyPosition++;
      console.log("History Position: " + historyPosition);
      console.log('history: ' + history);

      let changes = [];

      let newhistory = {
        changes:'',

      }

      e.forEach((element) => {
        console.log('With ID: ', element.id);
        let undoType = '';
        let redoType = '';

        // checks if element existed in the previous flow version
        const result = previousStoreState.find(({ id }) => id === element.id);
        console.log(result);  

        if(result === undefined){
          undoType = 'Delete';
          redoType = 'Add';
        }else{
          undoType = 'update';
          redoType = 'update';
        }

        //previousStoreState.getNode(element.id)
        refinedHistory.push({  
          undo: {
            type: undoType,
            e: element,
          },
          redo: {
            type: redoType,
            e: element,
          },
        });


      })

      // saves the state before the next change happens.
      previousStoreState = store.elements;

    }
  }
}
const onEdgeChange = (e: FlowEvents['edgesChange']) => {
  if(!dragActive ){
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
}

const onSelectionDragStart = (e: FlowEvents['selectionDragStart']) => {
  dragActive = true;
}

const onSelectionDragStop = (e: FlowEvents['selectionDragStop']) => {
  dragActive = false;
}
// undo save the original value
// redo save the new value

</script>

<template>
  <VueFlow 
  v-model="store.elements" 
  :fit-view-on-init="true"
  @node-drag-stop="onNodeDragStop"
  @node-drag-start="onNodeDragStart"
  @nodes-change="onNodesChange"
  @edges-change="onEdgeChange"
  @selection-drag-start="onSelectionDragStart"
  @selection-drag-stop="onSelectionDragStop"
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
