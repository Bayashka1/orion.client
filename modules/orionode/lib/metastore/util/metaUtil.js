/*******************************************************************************
 * Copyright (c) 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *	 IBM Corporation - initial API and implementation
 *******************************************************************************/
var args = require('../../args');
var async = require("async");
var api = require('../../api');
var SEPARATOR = "-";
module.exports.encodeWorkspaceId = function (userId, workspaceName) {
	var workspaceId = workspaceName.replace(/ /g, "").replace(/\#/g, "").replace(/\-/g, "");
	return userId + SEPARATOR + workspaceId;
};

module.exports.decodeUserIdFromWorkspaceId = function (workspaceId) {
	var index = workspaceId.lastIndexOf(SEPARATOR);
	if (index === -1) return null;
	return workspaceId.substring(0, index);
};

var decodeWorkspaceNameFromWorkspaceId = module.exports.decodeWorkspaceNameFromWorkspaceId = function (workspaceId) {
	var index = workspaceId.lastIndexOf(SEPARATOR);
	if (index === -1) return null;
	return workspaceId.substring(index + 1);
};

var getWorkspacePath = module.exports.getWorkspacePath = function(workspaceDir, workspaceId, userId){
	return [workspaceDir, userId.substring(0,2), userId, decodeWorkspaceNameFromWorkspaceId(workspaceId)];
};

module.exports.createWorkspaceDir = function (workspaceDir, userId, workspaceId, callback) {
	args.createDirs(getWorkspacePath(workspaceDir, workspaceId, userId), callback);
};

module.exports.readMetaUserFolder = function (workspaceDir, userId){
	return [workspaceDir, userId.substring(0,2), userId];
};

module.exports.getSeparator = function (){
	return SEPARATOR;
};

module.exports.getWorkspaceMeta = function (workspaceIds, store, workspaceRoot){
	var workspaceInfos = [];
	return new Promise(function(fulfill, reject){
		async.each(workspaceIds, 
			function(workspaceId, cb){
				if(typeof workspaceId !== "string"){
					workspaceId = workspaceId.id; // workspaceId is mongo object.
				}
				store.getWorkspace(workspaceId, function(err, workspaceMeta){
					if (err) {
						cb(err);
					}
					workspaceInfos.push({
						Id: workspaceId,
						Location: api.join(workspaceRoot, workspaceId),
						Name: workspaceMeta.name
					});
					cb();
				});
			}, 
			function(err) {
				if(err){
					return reject(err);
				}
				return fulfill();
			});
	}).then(function(){
		return workspaceInfos;
	})
};