// ============================================================================================================================
// This smart contract is used for managing the accounts
// It includes adding an account ,deleting an account,changing an
// account's password and verifying the account's password
// ============================================================================================================================
// 本智能合约用于用户余额管理
// 功能包括：增加账号 删除账号 账户转账
// ============================================================================================================================

package main

import (
	"errors"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"strconv"
)

type SimpleChaincode struct {
}

// ============================================================================================================================
// Init function is used for creating the Administrator account
// ============================================================================================================================

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	var ID string    // Administrator's ID
	var IDval string // balance of the Administrator ID
	var err error

	if len(args) != 2 {
		return nil, errors.New("Incorrect number of arguments. ")
	}

	// Initialize the chaincode
	ID = args[0]
	IDval = args[1]

	// Write the state to the ledger
	err = stub.PutState(ID, []byte(IDval))
	if err != nil {
		return nil, err
	}

	return nil, nil
}

// ============================================================================================================================
// Invoke function is the entry point for Invocations
// ============================================================================================================================
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {

	// Handle different functions
	if function == "init" { //add a new Administrator account
		return t.Init(stub, "init", args)
	} else if function == "delete" { //deletes an account from its state
		return t.Delete(stub, args)
	} else if function == "add" { //add a new account
		return t.Add(stub, args)
	} else if function == "transfer" { //change the password of the account
		return t.Transfer(stub, args)
	}

	return nil, errors.New("Received unknown function invocation")
}

// ============================================================================================================================
// Delete function is used for deleting an account
// 1 input
// "account"
// ============================================================================================================================
func (t *SimpleChaincode) Delete(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if len(args) != 1 {
		return nil, errors.New("Incorrect number of arguments. ")
	}
	account := args[0]
	err := stub.DelState(account) //remove the key from chaincode state
	if err != nil {
		return nil, errors.New("Failed to delete account")
	}

	return nil, nil
}

// ============================================================================================================================
// Add function is used for adding a new accounts
// 2 input
// "account","balance"
// ============================================================================================================================
func (t *SimpleChaincode) Add(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if len(args) != 2 {
		return nil, errors.New("Incorrect number of arguments. ")
	}
	account := args[0]
	balance := args[1]
	accountTest, err := stub.GetState(account)

	//test if the account has been existed
	if accountTest != nil {
		return nil, errors.New("the ccount is existed")
	}
	// add the account
	err = stub.PutState(account, []byte(balance))
	if err != nil {
		return nil, errors.New("Failed to add the account")
	}

	return nil, nil
}

// ============================================================================================================================
// Edit function is used for transfer money from account1 to account2
// 3 input
// "account","old password","new password"
// ============================================================================================================================
func (t *SimpleChaincode) Transfer(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if len(args) != 3 {
		return nil, errors.New("Incorrect number of arguments. ")
	}
	var A, B string
	var Aval, Bval int
	var X int
	A = args[0]
	B = args[1]

	Avalbytes, err := stub.GetState(A)
	if err != nil {
		return nil, errors.New("Failed to get state")
	}
	if Avalbytes == nil {
		return nil, errors.New("Entity not found")
	}
	Aval, _ = strconv.Atoi(string(Avalbytes))

	Bvalbytes, err := stub.GetState(B)
	if err != nil {
		return nil, errors.New("Failed to get state")
	}
	if Bvalbytes == nil {
		return nil, errors.New("Entity not found")
	}
	Bval, _ = strconv.Atoi(string(Bvalbytes))

	// Perform the execution
	X, err = strconv.Atoi(args[2])
	if err != nil {
		return nil, errors.New("Invalid transaction amount, expecting a integer value")
	}
	Aval = Aval - X
	Bval = Bval + X
	fmt.Printf("Aval = %d, Bval = %d\n", Aval, Bval)

	// Write the state back to the ledger
	err = stub.PutState(A, []byte(strconv.Itoa(Aval)))
	if err != nil {
		return nil, err
	}

	err = stub.PutState(B, []byte(strconv.Itoa(Bval)))
	if err != nil {
		return nil, err
	}

	return nil, nil
}

// ============================================================================================================================
// Query function is the entry point for Queries
// ============================================================================================================================
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {

	if function == "ifAccountExisted" { // reply if the account is existed
		return t.IfAccountExisted(stub, args)
	} else if function == "test" { //a function for testing
		return t.Test(stub, args)
	}

	return nil, errors.New("failed to query")

}

// ============================================================================================================================
// IfAccountExisted function is used for see if the account has been existed.
// 1 input
// "account"
// ============================================================================================================================
func (t *SimpleChaincode) IfAccountExisted(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if len(args) != 1 {
		return nil, errors.New("Incorrect number of arguments. ")
	}
	account := args[0]
	// Handle different functions
	_, err := stub.GetState(account) //get the var from chaincode state
	if err != nil {
		return nil, errors.New("account not found")
	}

	return []byte("ok"), nil
}

func (t *SimpleChaincode) Test(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	account := args[0]
	// Handle different functions
	password, err := stub.GetState(account) //get the var from chaincode state
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + account + "\"}"
		return nil, errors.New(jsonResp)
	}

	return password, nil
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
