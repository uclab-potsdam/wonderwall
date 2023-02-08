<script setup>
import { useDataStore } from "@/stores/data";
import { storeToRefs } from "pinia";
import { ref, computed, watch } from "vue";
import uniqBy from "lodash.uniqby";
import partition from "lodash.partition";
import groupBy from "lodash.groupby";
import VisEdge from "@/components/VisEdge.vue";
import VisNode from "@/components/VisNode.vue";
// import BaseInterpolate from "@/components/BaseInterpolate.vue";

const STROKE_DEG_2 = "#E1F5F3";
const STROKE_DEG_3 = "#FFFFFF";

// const syncStore = useSyncStore();
const dataStore = useDataStore();

const height = ref(innerHeight);
const width = ref(innerWidth);

const margin = [200, 200, 200, 200];
const degRange = 120;
const degOffsetRight = (180 - degRange) / 2 - 90;
const degOffsetLeft = degOffsetRight + 180;

const radius = computed(() => (height.value - margin[0] - margin[2]) / 2);

window.onresize = () => {
  height.value = innerHeight;
  width.value = innerWidth;
};

dataStore.connect();

const getSecondaryEntities = (primaryNode) => {
  const subjects = dataStore.relations.filter((relation) => relation.object === primaryNode.entity.id);
  const objects = dataStore.relations.filter((relation) => relation.subject === primaryNode.entity.id);

  const positionEntities = (entities, isSubject) => {
    return entities
      .map((relation, i, relations) => {
        return {
          entity: dataStore.entities.find((e) => e.id === relation[isSubject ? "subject" : "object"]),
          isSubject,
          relation,
          position: calculateCoordinates(i, relations.length, radius.value, isSubject),
          degree: 2,
        };
      })
      .filter((r) => r.entity != null);
  };

  const nodes = [...positionEntities(subjects, true), ...positionEntities(objects, false)];

  const edges = nodes.map((node) => ({
    [node.isSubject ? "source" : "target"]: { ...node.position, id: node.entity.id },
    [node.isSubject ? "target" : "source"]: { ...primaryNode.position, id: primaryNode.entity.id },
    origin: primaryNode.entity.id,
    label: node.relation.predicate,
    degree: 2,
    stroke: STROKE_DEG_2,
  }));

  return { nodes: [...positionEntities(subjects, true), ...positionEntities(objects, false)], edges };
};

const calculateCoordinates = (index, count, r, alignLeft, offset = { x: 0, y: 0 }) => {
  const fraction = count === 1 ? 0.5 : (1 / (count - 1)) * index;
  const deg = fraction * degRange + (alignLeft ? degOffsetLeft : degOffsetRight);
  const xOffset = alignLeft ? -100 : 100;
  const x = r * Math.cos((Math.PI * 2 * deg) / 360) + offset.x + xOffset;
  const y = r * Math.sin((Math.PI * 2 * deg) / 360) + offset.y;

  return { x, y };
};

const getTertiaryEntities = (primaryNode, secondaryNodes) => {
  // find all relations (as subject and object) for all secondary nodes
  // except for the ones relating to the primary node (we already have those relations)
  // also note down subject/object relation (is subject) and the secondaryNode for later use (placement)
  const tertiaryNodes = secondaryNodes
    .map((node) => {
      const subjects = dataStore.relations
        .filter((relation) => relation.object === node.entity.id && relation.subject !== primaryNode.entity.id)
        .map((relation) => ({ relation, secondaryNode: node, entity: { id: relation.subject }, isSubject: true }));
      const objects = dataStore.relations
        .filter((relation) => relation.subject === node.entity.id && relation.object !== primaryNode.entity.id)
        .map((relation) => ({ relation, secondaryNode: node, entity: { id: relation.object }, isSubject: false }));

      return [subjects, objects];
    })
    .flat(2);

  // partition tertiary nodes into placed (because they are also secondary nodes) and unplaced nodes
  const placedNodeIds = secondaryNodes.map((node) => node.entity.id);
  const tertiaryNodesPartitioned = partition(tertiaryNodes, (node) => placedNodeIds.includes(node.entity.id));
  const placedNodes = tertiaryNodesPartitioned[0].filter((node) => node.isSubject);

  // partition remaining nodes into duplicates (disputed) and uniques
  const unplacedNodeIds = tertiaryNodesPartitioned[1].map((node) => node.entity.id);
  const unplacedNodes = partition(
    tertiaryNodesPartitioned[1],
    (node) => unplacedNodeIds.filter((id) => id === node.entity.id).length > 1
  );
  // group unique nodes by their secondary node and calculate positions
  const placableNodes = Object.entries(groupBy(unplacedNodes[1], (node) => node.secondaryNode.entity.id))
    .map((group) => {
      const nodes = group[1];
      return nodes.map((node, i) => {
        return {
          ...node,
          position: calculateCoordinates(
            i,
            nodes.length,
            radius.value * 0.5,
            node.secondaryNode.position.x < 0,
            node.secondaryNode.position
          ),
          degree: 3,
        };
      });
    })
    .flat();
  // group disputed (duplicated) nodes by their id and calculate positions
  const disputedNodes = Object.entries(
    groupBy(
      Object.entries(groupBy(unplacedNodes[0], (node) => node.entity.id)).map((group) => {
        const nodes = group[1];
        const isTop =
          0 >
          nodes.reduce(
            (node1, node2) => (node1?.secondaryNode?.position?.y || 0) + (node2?.secondaryNode?.position?.y || 0),
            {
              secondaryNode: { position: { y: 0 } },
            }
          ) /
            nodes.length;
        return { isTop, nodes };
      }),
      "isTop"
    )
  )
    .map((group) => {
      const verticalAlign = group[0] === "true" ? -1 : 1;
      const nodes = group[1];
      return nodes.map((node, i) => {
        const count = nodes.length;
        const fraction = count === 1 ? 0.5 : (1 / (count - 1)) * i;
        const h = (height.value - margin[0] - margin[2]) / 2;
        const range = h * 0.6;
        const offset = h * 0.4;
        const x = 0;
        const y = (offset + range * fraction) * verticalAlign;

        return {
          position: { x, y },
          entity: node.nodes[0].entity,
          degree: 3,
          subnodes: node.nodes,
        };
      });
    })
    .flat();

  const edges = [
    ...placedNodes.map((node) => {
      const originalNode = secondaryNodes.find((n) => n.entity.id === node.entity.id);
      return {
        [node.isSubject ? "source" : "target"]: { ...originalNode.position, id: originalNode.entity.id },
        [node.isSubject ? "target" : "source"]: { ...node.secondaryNode.position, id: node.secondaryNode.entity.id },
        label: node.relation.predicate,
        origin: node.secondaryNode.entity.id,
        degree: 3,
        stroke: STROKE_DEG_3,
      };
    }),
    ...placableNodes.map((node) => ({
      [node.isSubject ? "source" : "target"]: { ...node.position, id: node.entity.id },
      [node.isSubject ? "target" : "source"]: { ...node.secondaryNode.position, id: node.secondaryNode.entity.id },
      label: node.relation.predicate,
      origin: node.secondaryNode.entity.id,
      degree: 3,
      stroke: STROKE_DEG_3,
    })),
    ...disputedNodes
      .map((node) => {
        return node.subnodes.map((subnode) => ({
          [subnode.isSubject ? "source" : "target"]: { ...node.position, id: node.entity.id },
          [subnode.isSubject ? "target" : "source"]: {
            ...subnode.secondaryNode.position,
            id: subnode.secondaryNode.entity.id,
          },
          origin: subnode.secondaryNode.entity.id,
          label: subnode.relation.predicate,
          degree: 3,
          stroke: STROKE_DEG_3,
        }));
      })
      .flat(),
  ];
  return { nodes: [...placableNodes, ...disputedNodes], edges };
};

const layout = computed(() => {
  if (dataStore.activeEntity == null) return [];
  const primaryNode = { entity: dataStore.activeEntity, position: { x: 0, y: 0 }, degree: 1 };
  const secondary = getSecondaryEntities(primaryNode);
  // const left = getSecondaryEntities(dataStore.activeEntity?.id, "LEFT", "IN");
  // const right = getSecondaryEntities(dataStore.activeEntity?.id, "RIGHT", "OUT");

  // const placed = [...left, ...right]

  const tertiary = getTertiaryEntities(primaryNode, secondary.nodes);

  // const edges = secondaryEntities.map((node) => ({
  //   [node.isSubject ? "source" : "target"]: { ...node.position, id: node.entity.id },
  //   [node.isSubject ? "target" : "source"]: { ...primaryNode.position, id: primaryNode.entity.id },
  //   label: node.relation.predicate,
  // }));

  // const nodes = uniqBy([...tertiary.nodes, ...secondary.nodes, primaryNode], (node) => node.entity.id);
  const nodes = [...secondary.nodes, primaryNode];

  const edges = [...tertiary.edges, ...secondary.edges].map((edge) => {
    return {
      ...edge,
      next:
        dataStore.history.includes(edge.source.id) && dataStore.history.includes(edge.target.id)
          ? dataStore.history[0]
          : null,
    };
  });

  // const worm = drawWorm(nodes);

  return {
    nodes,
    edges,
    // worm,
  };
});

const svg = ref(null);

function enterFullscreen() {
  svg.value.requestFullscreen();
}
</script>

<template>
  <div ref="svg" class="svg-wrapper">
    <svg @dblclick="enterFullscreen">
      <defs>
        <marker id="arrow" markerWidth="15" markerHeight="10" refX="7" refY="5" orient="auto">
          <path d="M2,1 L7,5 L2,9" stroke="#216B5E" fill="none" />
        </marker>
      </defs>
      <rect class="background" :width="width" :height="height" />
      <g class="svg-root" :transform="`translate(${width / 2} ${height / 2})`">
        <g class="edges" v-if="dataStore.activeEntity">
          <!-- <g class="edges" v-if="dataStore.activeEntity">
          <BaseInterpolate
            v-for="edge in layout.edges"
            :key="`${edge.source.id}--${edge.label}--${edge.target.id}`"
            :props="{ edge }"
            v-slot="interpolated"
          >
            <VisEdge v-bind="interpolated.edge" />
          </BaseInterpolate>
        </g> -->
          <TransitionGroup name="default">
            <VisEdge
              v-for="edge in layout.edges"
              :key="`${edge.source.id}--${edge.label}--${edge.target.id}`"
              v-bind="edge"
            />
          </TransitionGroup>
        </g>
        <!-- <g class="history-path">
        <TransitionGroup name="default">
          <VisEdge
            v-for="edge in layout.history"
            :key="`history--${edge.source.id}-${edge.source.gen}--${edge.target.id}-${edge.target.gen}`"
            v-bind="edge"
          />
        </TransitionGroup>
      </g> -->
        <!-- <g class="nodes" v-if="dataStore.activeEntity">
        <BaseInterpolate
          v-for="node in layout.nodes"
          :key="node.entity.id"
          :props="{ position: node.position }"
          v-slot="interpolated"
        >
          <VisNode :entity="node.entity" v-bind="interpolated" />
        </BaseInterpolate>
      </g> -->

        <g class="nodes" v-if="dataStore.activeEntity">
          <TransitionGroup name="default">
            <VisNode
              v-for="node in layout.nodes"
              :key="node.entity.id"
              :entity="node.entity"
              :position="node.position"
              :degree="node.degree"
              @select="dataStore.select"
            />
          </TransitionGroup>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped lang="scss">
svg {
  position: absolute;
  width: 100%;
  height: 100%;

  .background {
    fill: rgb(var(--blue-gray-9));
    stroke: none;
  }

  .svg-root {
    isolation: isolate;
  }

  .links {
    .link {
      .label {
        text-anchor: middle;
        font-size: var(--font-size);
        fill: rgb(var(--blue-gray-2));
        text-transform: uppercase;
      }

      path {
        stroke: rgb(var(--blue-gray-8));
      }
    }
  }

  .nodes {
    .node {
      foreignObject {
        overflow: visible;
      }
      .label {
        position: fixed;
        // color: rgba(var(--gray-4));
        transform: translate(-50%, -50%);
        font-size: var(--font-size-l);
        // text-align: center;

        // opacity: 0;
        transition: opacity 0.5s;
        filter: blur(0.5px);
        mark {
          transition: font-weight 0.5s, color 0.5s;
          background-color: rgba(var(--blue-gray-10), 0.5);
          // outline: var(--spacing-xs) solid rgb(var(--blue-gray-10));
          // box-shadow: 5px 0 red;
          color: rgb(var(--blue-gray-8));
        }

        &.active {
          opacity: 1;
          filter: blur(0px);

          mark {
            font-weight: 600;
            color: rgb(var(--gray-0));
            font-size: var(--font-size-l);
            // background-color: rgb(var(--yellow-7));
            // outline: var(--spacing-xs) solid rgb(var(--yellow-7));
          }
        }
      }
    }
  }

  .default-enter-active {
    transition: all 0.5s 1.5s ease;
  }
  .default-leave-active {
    transition: all 0.5s ease;
  }
  .default-enter-from,
  .default-leave-to {
    opacity: 0;
    // filter: blur(15px);
  }
}
</style>
