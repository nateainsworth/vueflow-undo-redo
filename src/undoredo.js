import { useVueFlow } from '@braks/vue-flow'
import { defineComponent } from 'vue'

const flowKey = 'example-flow'

const { nodes, addNodes, setNodes, setEdges, dimensions, setTransform, toObject } = useVueFlow()


export default class reStoreController {

    static logChange(object){
      localStorage.setItem(flowKey, object)
    }
    static undoChange(){
      const flow = JSON.parse(localStorage.getItem(flowKey))
      return flow;
    }

    static redoChange(){

    }
};


const onSave = () => {
  localStorage.setItem(flowKey, JSON.stringify(toObject()))
}

const onRestore = () => {
  const flow = JSON.parse(localStorage.getItem(flowKey))

  if (flow) {
    const [x = 0, y = 0] = flow.position
    setNodes(flow.nodes)
    setEdges(flow.edges)
    setTransform({ x, y, zoom: flow.zoom || 0 })
  }
}
