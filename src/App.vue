<script setup>
import { VueFlow, useVueFlow } from '@braks/vue-flow';
import { computed, watch } from 'vue';
import useStore from './store.js';
import Controls from './Controls.vue'
import reStore from './undoredo.js';

const store = useStore();

//const reStore2 = reStore();

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

const { onConnect, addEdges } = useVueFlow();

onConnect((params) => addEdges([params]));

const onUndo = () => {
  const reloadFlow = reStore.undoChange();
  store.elements = reloadFlow;
}

</script>

<template>
  <VueFlow v-model="store.elements" :fit-view-on-init="true">
    <div style="position: absolute; right: 10px; top: 10px; z-index: 4">
      <button @click="store.log">log store state</button>
      <button @click="onUndo">Undo</button>
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
