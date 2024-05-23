<template>
  <div class="multi-position-panel">
    <ButtonGroup class="row">
      <Button style="flex: 1;" v-tooltip="'left aligned'" @click="alignElement(ElementAlignCommands.LEFT)"><IconAlignLeft /></Button>
      <Button style="flex: 1;" v-tooltip="'levelcenter aligned'" @click="alignElement(ElementAlignCommands.HORIZONTAL)"><IconAlignHorizontally /></Button>
      <Button style="flex: 1;" v-tooltip="'right aligned'" @click="alignElement(ElementAlignCommands.RIGHT)"><IconAlignRight /></Button>
    </ButtonGroup>
    <ButtonGroup class="row">
      <Button style="flex: 1;" v-tooltip="'上Alignment'" @click="alignElement(ElementAlignCommands.TOP)"><IconAlignTop /></Button>
      <Button style="flex: 1;" v-tooltip="'verticalcenter aligned'" @click="alignElement(ElementAlignCommands.VERTICAL)"><IconAlignVertically /></Button>
      <Button style="flex: 1;" v-tooltip="'下Alignment'" @click="alignElement(ElementAlignCommands.BOTTOM)"><IconAlignBottom /></Button>
    </ButtonGroup>
    <ButtonGroup class="row" v-if="displayItemCount > 2">
      <Button style="flex: 1;" @click="uniformHorizontalDisplay()">horizontally distribution</Button>
      <Button style="flex: 1;" @click="uniformVerticalDisplay()">vertically distributed</Button>
    </ButtonGroup>

    <Divider />

    <ButtonGroup class="row">
      <Button :disabled="!canCombine" @click="combineElements()" style="flex: 1;"><IconGroup style="margin-right: 3px;" />combination </Button>
      <Button :disabled="canCombine" @click="uncombineElements()" style="flex: 1;"><IconUngroup style="margin-right: 3px;" />Cancelcombination </Button>
    </ButtonGroup>
  </div>
</template>

<script lang="ts" setup>
import { ElementAlignCommands } from '@/types/edit'
import useCombineElement from '@/hooks/useCombineElement'
import useAlignActiveElement from '@/hooks/useAlignActiveElement'
import useAlignElementToCanvas from '@/hooks/useAlignElementToCanvas'
import useUniformDisplayElement from '@/hooks/useUniformDisplayElement'
import Divider from '@/components/Divider.vue'
import Button from '@/components/Button.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'

const { canCombine, combineElements, uncombineElements } = useCombineElement()
const { alignActiveElement } = useAlignActiveElement()
const { alignElementToCanvas } = useAlignElementToCanvas()
const { displayItemCount, uniformHorizontalDisplay, uniformVerticalDisplay } = useUniformDisplayElement()

// 多选元素Alignment，需要先判断当前所选中的元素状态：
// 如果所选元素为一组combination 元素，则将它Alignment到画布；
// 如果所选元素不是combination 元素或不止一组元素（即当前为可combination 状态），则将这多个（多组）元素相互Alignment。
const alignElement = (command: ElementAlignCommands) => {
  if (canCombine.value) alignActiveElement(command)
  else alignElementToCanvas(command)
}
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>