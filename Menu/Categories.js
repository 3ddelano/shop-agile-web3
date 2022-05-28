import React from 'react';

const Categories = (props) => {
	const {categories,filterItems} = props
  return(
  	<div className = 'btn-container'>
  	{categories.map((category)=>{
  		return(
  			<button type = 'button' className = 'filter-btn' onClick = {()=>filterItems(category)}>
  			{category}
  			</button>
  			)
  	})}
  	</div>
  	)
};

export default Categories;