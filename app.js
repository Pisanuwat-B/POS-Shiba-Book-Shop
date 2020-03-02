var app = angular.module('posBookStore', []);

app.controller('PosController', function ($scope) {

	// Fetching API
	fetch('https://api.jsonbin.io/b/5c52a1be15735a25423d3540').then(response => {
    return response.json()
  }).then(data => {
    $scope.books = data.books;
    $scope.$apply();
  }).catch(err => {
    console.log(err)
  })

	$scope.order = [];
	$scope.new = {};
	$scope.totOrders = 0;
	$scope.discountable = [0, 0, 0, 0, 0, 0, 0];
	$scope.discountItemPrice = [350, 350, 340, 360, 380, 380, 400];
	$scope.discount = 0;

	$scope.getDate = function () {
		var today = new Date();
		var mm = today.getMonth() + 1;
		var dd = today.getDate();
		var yyyy = today.getFullYear();
		var date = dd + "/" + mm + "/" + yyyy
		return date
	};

	$scope.calDiscount = function (item, opt) {

		// recalculation evertime order list change
		$scope.discount = 0;
		var discountGroup = ['9781408855652', '9781408855669', '9781408855676', '9781408855683', '9781408855690', '9781408855706', '9781408855713']
		var discountPercent = [10, 11, 12, 13, 14, 15]
		var bookNo = $.inArray(item.id, discountGroup)

		// check what type of change occur
		if (bookNo !== -1) {
			if (opt === 1) {
				$scope.discountable[bookNo] += 1;
			} else if (opt === 2) {
				$scope.discountable[bookNo] -= 1;
			} else if (opt === 3) {
				$scope.discountable[bookNo] = 0;
			}
		}
		var tempDiscountable = $scope.discountable.slice(0);
		function discountFilter(num) {
			if (num !== 0) {
				return num - 1;
			} else {
				return num = 0;
			}
		}
		// count relevant book
		var count = tempDiscountable.reduce((n, x) => n + (x !== 0), 0);
		while (count !== 1){
			count = tempDiscountable.reduce((n, x) => n + (x !== 0), 0);

			// apply discount to the relevant book
			if (count === 7) {
				$scope.discount += 384
				tempDiscountable = tempDiscountable.map(discountFilter);
			} else if (count < 7 && count > 1 ) {
				var bookPrice = 0;
				var temp2 = tempDiscountable.slice(0);
				for (var i = 0; i < count; i++) {
					index = tempDiscountable.findIndex(n => n !== 0)
					bookPrice += $scope.discountItemPrice[index]
					temp2[index] = 0
				}

				// cumulate discount
				$scope.discount += (bookPrice * discountPercent[count-2] / 100);
				tempDiscountable = tempDiscountable.map(discountFilter);
			} else {
				break;
			}
		}
	};


	$scope.addToOrder = function (item, qty) {
		$scope.calDiscount(item, 1);
		var flag = 0;
		if ($scope.order.length > 0) {
			for (var i = 0; i < $scope.order.length; i++) {
				if (item.id === $scope.order[i].id) {
					item.qty += qty;
					flag = 1;
					break;
				}
			}
			if (flag === 0) {
				item.qty = 1;
			}
			if (item.qty < 2) {
				$scope.order.push(item);
			}
		} else {
			item.qty = qty;
			$scope.order.push(item);
		}
	};

	$scope.removeOneEntity = function (item) {
		$scope.calDiscount(item, 2);
		for (var i = 0; i < $scope.order.length; i++) {
			if (item.id === $scope.order[i].id) {
				item.qty -= 1;
				if (item.qty === 0) {
					$scope.order.splice(i, 1);
				}
			}
		}
	};

	$scope.removeItem = function (item) {
		$scope.calDiscount(item, 3);
		for (var i = 0; i < $scope.order.length; i++) {
			if (item.id === $scope.order[i].id) {
				$scope.order.splice(i, 1);
			}
		}
	};

	$scope.getTotal = function () {
		var tot = 0;
		for (var i = 0; i < $scope.order.length; i++) {
			tot += ($scope.order[i].price * $scope.order[i].qty)
		}
		return tot;
	};

	$scope.getDiscount = function () {
		return $scope.discount;
	}

	$scope.getTotalOrder = function () {
		return $scope.totOrders+1;
	}

	$scope.clearOrder = function () {
		$scope.discountable = [0, 0, 0, 0, 0, 0, 0];
		$scope.discount = 0;
		$scope.order = [];
	};

	$scope.checkout = function (index) {
		alert($scope.getDate() + " - Order Number: " + ($scope.totOrders+1) 
			+ "\n\nOrder amount: $" + $scope.getTotal().toFixed(2) + "\n\nDiscount amount: $" + $scope.getDiscount().toFixed(2) 
			+ "\n\nNet amount: $" + ($scope.getTotal() - $scope.getDiscount()).toFixed(2)  + "\n\nPayment received. Thanks you for your patronage.");
		$scope.order = [];
		$scope.totOrders += 1;
		$scope.discountable = [0, 0, 0, 0, 0, 0, 0];
		$scope.discount = 0;
	};
});

// hovering function for book list
$(document).on('mouseenter','.card-hover', function() {
    $( this ).addClass('hovering');
}).on('mouseleave','.card-hover',  function(){
    $( this ).removeClass('hovering');
});

$(document).on('mousedown','.card-hover', function() {
    $( this ).addClass('downing');
}).on('mouseup','.card-hover',  function(){
    $( this ).removeClass('downing');
});