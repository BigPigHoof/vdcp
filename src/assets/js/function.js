
export function upGo(fieldData, index) {
    if (index != 0) {
      fieldData[index] = fieldData.splice(index - 1, 1, fieldData[index])[0];
    } else {
      fieldData.push(fieldData.shift());
    }
  }
export function downGo(fieldData, index) {
    if (index != fieldData.length - 1) {
      fieldData[index] = fieldData.splice(index + 1, 1, fieldData[index])[0];
    } else {
      fieldData.unshift(fieldData.splice(index, 1)[0]);
    }
  }
  export function getCompetence(id){
    if(  isNaN(id)){
      return id<3?true:false
    }else{
      return false;
    }
  }
  export function formatterSex(row) {
    if(row.xb==0){
      return '女'
    }
     else if(row.xb==1){
      return '男'
    }else{
      return '';
    }   
  }