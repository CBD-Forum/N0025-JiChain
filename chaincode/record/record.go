// ============================================================================================================================
// This smart contract is used for storing and verifying the original medical record
// It includes creating the Administrator account ,adding the original medical record
// and verifying the aoriginal medical record
// ============================================================================================================================

package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

type SimpleChaincode struct {
}

type RecordDetail struct {
	DbIP       string `json:"dbIP"`       //user who created the open trade order
	RecordHash string `json:"recordHash"` //
}

type RecordDiseaseIndexDetail struct {
	RecordID string `json:"recordID"`
	DbIP     string `json:"dbIP"` //user who created the open trade order

}

type RecordDiseaseIndex struct {
	RecordDiseaseIndexDetails []RecordDiseaseIndexDetail `json:"recordDiseaseIndexDetails"` //user who created the open trade order
}

// ============================================================================================================================
// Init function is used for creating the Administrator account
// ============================================================================================================================

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	var ID string    // Administrator's ID
	var IDval string // Password of the Administrator ID
	var err error

	if len(args) != 2 {
		return nil, errors.New("Incorrect number of arguments. ")
	}
	ID = args[0]
	IDval = args[1]
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

	} else if function == "add" { //add a new account
		return t.Add(stub, args)
	}

	return nil, errors.New("Received unknown function invocation")
}

// ============================================================================================================================
// Add function is used for add an new medical record
// 4 input
// "medical record ID","medical record db address","medical record hash"
// ============================================================================================================================
func (t *SimpleChaincode) Add(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if len(args) != 4 {
		return nil, errors.New("Incorrect number of arguments. ")
	}
	// write the record details into the world state and the chain
	recordID := args[0]
	var recordDetail RecordDetail
	recordDetail.DbIP = args[1]
	recordDetail.RecordHash = args[2]
	JsonRecordDetail, _ := json.Marshal(recordDetail)
	recordTest, err := stub.GetState(recordID)

	//test if the account has been existed
	if recordTest != nil {
		return nil, errors.New("the record is existed")
	}
	// add the hash
	err = stub.PutState(recordID, JsonRecordDetail)
	if err != nil {
		return nil, errors.New("Failed to add the record")
	}

	// write the disease index of the record details into the world state and the chain
	disease := args[3]
	var recordDiseaseIndexDetail RecordDiseaseIndexDetail
	var recordDiseaseIndexDetails RecordDiseaseIndex
	recordDiseaseIndexDetail.RecordID = args[0]
	recordDiseaseIndexDetail.DbIP = args[1]
	recordDiseaseIndexAsBytes, errs := stub.GetState(disease)
	if errs != nil {
		return nil, errors.New("Failed to get disease index details")
	}
	json.Unmarshal(recordDiseaseIndexAsBytes, &recordDiseaseIndexDetails)
	recordDiseaseIndexDetails.RecordDiseaseIndexDetails = append(recordDiseaseIndexDetails.RecordDiseaseIndexDetails, recordDiseaseIndexDetail)
	jsonAsBytes, _ := json.Marshal(recordDiseaseIndexDetails)
	err = stub.PutState(disease, jsonAsBytes)
	return nil, nil
}

// ============================================================================================================================
// Query function is the entry point for Queries
// ============================================================================================================================
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {

	if function == "query" { //deletes an account from its state
			return t.Get(stub, args)
		} else if function == "verify" {
			return t.VerifyRecordHash(stub, args)

		}

	return nil, errors.New("failed to query")

}

// ============================================================================================================================
// Get function is used for getting the medical record details
// 1 input
// "medical record ID"
// ============================================================================================================================
func (t *SimpleChaincode) Get(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	recordID := args[0]
	// Handle different functions
	recordDetail, err := stub.GetState(recordID) //get the var from chaincode state
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + recordID + "\"}"
		return nil, errors.New(jsonResp)
	}

	return recordDetail, nil
}

// ============================================================================================================================
// VerifyRecordHash function is used for verifying the medical record in this smart contract
// 2 input
// "medical record ID","medical record hash"
// ============================================================================================================================
func (t *SimpleChaincode) VerifyRecordHash(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	if len(args) != 2 {
		return nil, errors.New("Incorrect number of arguments. ")
	}
	recordID := args[0]
	recordHash := args[1]
	recordTest, err := stub.GetState(recordID)
	var JsonRecordTest RecordDetail
	json.Unmarshal(recordTest, &JsonRecordTest)
	ver := []byte("ok")
	jsonResp := "{\"Error\":\"Failed to get state for " + recordID + "\"}"
	//test if the account has been existed
	if err != nil {
		return nil, errors.New(jsonResp)
	}
	if recordTest == nil {
		return nil, errors.New(jsonResp)
	}

	// verify
	if recordHash == string(JsonRecordTest.RecordHash) {
		return ver, nil

	} else {
		return nil, errors.New("Failed to verify the record")
	}

}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
