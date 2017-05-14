// ============================================================================================================================
// This smart contract is used for managing the accounts
// It includes adding an account ,deleting an account,changing an
// account's password and verifying the account's password
// ============================================================================================================================
// 本智能合约用于存储医院和医疗分析机构对病人病历的申请状态
// 功能包括：添加记录查询状态
// ============================================================================================================================
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

type RequestState struct {
	CeleresID  string `json:"celeresID"`  //user who requested for the medical record
	HospitalID string `json:"hospitalID"` //the ID of the hospital which stores this medical record
	Hcode      string `json:"hcode"`      //the authorization code of the hospital
	PatientID  string `json:"patientID"`  // the ID of the patient who owns the medical record
	Pcode      string `json:"pcode"`      //the authorization code of the patient
}

// ============================================================================================================================
// the Init function is used for deploying the chaincode and setting the Administrator account
// ============================================================================================================================
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	var ID string    // Administrator's ID
	var IDval string // Password of the Administrator ID
	var err error

	if len(args) != 2 {
		return nil, errors.New("Incorrect number of arguments. ")
	}

	// Initialize the chaincode
	ID = args[0]
	IDval = args[1]

	// Write the password to the ledger
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

	if function == "init" {
		return t.Init(stub, "init", args)
	} else if function == "add" {
		return t.Add(stub, args)
	}

	return nil, errors.New("Received unknown function invocation")
}

// ============================================================================================================================
// Add function is used for add an new request record of the hospital or the celeres
// 6 input
// "requestID","requester","hospitalID","hospital authorization code","patient","hpatient authorization code"
// ============================================================================================================================
func (t *SimpleChaincode) Add(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if len(args) != 6 {
		return nil, errors.New("Incorrect number of arguments. ")
	}
	requestID := args[0]
	var requestState RequestState
	requestState.CeleresID = args[1]
	requestState.HospitalID = args[2]
	requestState.Hcode = args[3]
	requestState.PatientID = args[4]
	requestState.Pcode = args[5]
	JsonRequestState, _ := json.Marshal(requestState)

	// add the account
	err := stub.PutState(requestID, JsonRequestState)
	if err != nil {
		return nil, errors.New("Failed to add the account")
	}

	return nil, nil
}

// ============================================================================================================================
// Query function is the entry point for Queries
// ============================================================================================================================
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	//account := args[0]
	// Handle different functions
	//password, err := stub.GetState(account) //get the var from chaincode state

	if function == "verify" {
		return t.VerifyQuery(stub, args)
	} else if function == "test" { //add a new Administrator account
		return t.Test(stub, args)
	}

	return nil, errors.New("failed to query")

}

// ============================================================================================================================
// VerifyQuery function is used for replying the state of the medical record request
// 1 input
// "requestID"
// ============================================================================================================================
func (t *SimpleChaincode) VerifyQuery(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if len(args) != 1 {
		return nil, errors.New("Incorrect number of arguments. ")
	}
	requestID := args[0]
	result, err := stub.GetState(requestID)
	//test if the account has been existed
	if err != nil {
		return nil, errors.New("error in reading request record")
	}

	return result, nil

}

func (t *SimpleChaincode) Test(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	//fmt.Println("query is running " + function)
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
